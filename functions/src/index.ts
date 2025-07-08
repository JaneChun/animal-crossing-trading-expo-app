import axios from 'axios';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import {
	onDocumentCreated,
	onDocumentDeleted,
} from 'firebase-functions/v2/firestore';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

admin.initializeApp();
const db = admin.firestore();

// Apple이 제공하는 공개키 모음(JSON Web Key Set)을 가져오는 클라이언트
const appleClient = jwksClient({
	jwksUri: 'https://appleid.apple.com/auth/keys',
});

// JWT의 key ID를 입력받아, 해당 kid에 해당하는 PEM 형식 공개 키 문자열 반환
function getAppleSigningKey(kid: string): Promise<string> {
	return new Promise((resolve, reject) => {
		appleClient.getSigningKey(kid, (err, key) => {
			if (err) return reject(err);
			resolve(key!.getPublicKey());
		});
	});
}

// Apple ID Token 검증
async function verifyAppleIdToken(idToken: string, rawNonce: string) {
	// 1. JWT 헤더 디코딩 -> kid 추출
	const decodedHeader: any = jwt.decode(idToken, { complete: true })?.header;
	if (!decodedHeader?.kid) {
		throw new functions.https.HttpsError(
			'invalid-argument',
			'Invalid Apple ID Token',
		);
	}

	// 2. JWKS에서 공개키 가져와 서명 검증
	const publicKey = await getAppleSigningKey(decodedHeader.kid);
	const payload: any = jwt.verify(idToken, publicKey, {
		algorithms: ['RS256'],
		audience: 'com.janechun.animalcrossingtradingapp',
		issuer: 'https://appleid.apple.com',
	});

	// 3. payload.nonce 와 rawNonce 해시값 비교
	const expectedNonce = crypto
		.createHash('sha256')
		.update(rawNonce)
		.digest('hex');
	if (payload.nonce !== expectedNonce) {
		throw new functions.https.HttpsError('invalid-argument', 'Invalid nonce');
	}

	return payload; // { sub, email, email_verified, ... }
}

export const getFirebaseCustomToken = functions.https.onCall(
	async (request) => {
		const { oauthType, accessToken, idToken, rawNonce } = request.data as {
			oauthType: string;
			accessToken?: string; // 네이버, 카카오
			idToken?: string; // Apple
			rawNonce?: string; // Apple
		};

		if (!oauthType) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'oauthType가 누락되었습니다.',
			);
		}

		try {
			let providerId: string;
			let email: string | undefined;

			if (oauthType === 'kakao') {
				if (!accessToken) {
					throw new functions.https.HttpsError(
						'invalid-argument',
						'accessToken이 누락되었습니다.',
					);
				}

				// 카카오 API 호출
				const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				providerId = String(data.id);
				email = data.kakao_account.email;
			} else if (oauthType === 'naver') {
				if (!accessToken) {
					throw new functions.https.HttpsError(
						'invalid-argument',
						'accessToken이 누락되었습니다.',
					);
				}

				// 네이버 API 호출
				const { data } = await axios.get(
					'https://openapi.naver.com/v1/nid/me',
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					},
				);

				if (data.resultcode !== '00') {
					throw new Error('네이버 사용자 정보 조회 실패');
				}

				providerId = String(data.response.id);
				email = data.response.email;
			} else if (oauthType === 'apple') {
				if (!idToken || !rawNonce) {
					throw new functions.https.HttpsError(
						'invalid-argument',
						'idToken과 rawNonce가 누락되었습니다.',
					);
				}

				const payload = await verifyAppleIdToken(idToken, rawNonce);
				providerId = payload.sub;
				email = payload.email as string;
			} else {
				throw new functions.https.HttpsError(
					'invalid-argument',
					'지원하지 않는 oauthType입니다.',
				);
			}

			// 30일 이내 재가입 제한
			const deletedDoc = await admin
				.firestore()
				.doc(`DeletedUsers/${providerId}`)
				.get();

			if (deletedDoc.exists) {
				const { deletedAt } = deletedDoc.data()!;
				if (
					Date.now() - deletedAt.toDate().getTime() <
					30 * 24 * 60 * 60 * 1000
				) {
					throw new functions.https.HttpsError(
						'failed-precondition',
						'30일 이내 재가입이 제한된 계정입니다.',
					);
				}
			}

			// Firebase Custom Token 생성
			const customToken = await admin.auth().createCustomToken(providerId);

			return {
				firebaseToken: customToken,
				user: { email },
			};
		} catch (e: any) {
			console.error('Firebase Custom Token 생성 실패:', e);

			// 이미 HttpsError 로 던져진 경우 (failed-precondition 등) 그대로 재던짐
			if (e instanceof functions.https.HttpsError) {
				throw e;
			}

			// 그 외 예외만 internal 로 감싸기
			throw new functions.https.HttpsError(
				'internal',
				'Firebase Custom Token 생성 중 오류가 발생했습니다.',
				e.message,
			);
		}
	},
);

function getSafeUid(uid: string) {
	return uid.replace(/\./g, '');
}

export const onMessageCreated = onDocumentCreated(
	'Chats/{chatId}/Messages/{messageId}',
	async (event) => {
		const { chatId } = event.params;

		const snapshot = event.data;
		if (!snapshot) return;

		const message = snapshot.data();
		const { receiverId, senderId, body } = message;

		// 시스템, 리뷰 작성 메세지는 제외 X
		if (
			senderId === 'system' ||
			senderId === 'review' ||
			!senderId ||
			!receiverId ||
			!body
		)
			return;

		// 1. 채팅방 정보 업데이트 (최근 메시지, 보낸 사람, 시간)
		const chatRef = db.collection('Chats').doc(chatId);
		await chatRef.update({
			lastMessage: message.body,
			lastMessageSenderId: message.senderId,
			updatedAt: Timestamp.now(),
			[`unreadCount.${getSafeUid(message.receiverId)}`]:
				FieldValue.increment(1), // 상대 유저의 unreadCount 1 증가
			visibleTo: FieldValue.arrayUnion(message.receiverId), // 메시지를 받은 유저에게 채팅방 다시 표시
		});

		// 2. 푸시 알림 전송
		const receiverDoc = await admin
			.firestore()
			.doc(`Users/${receiverId}`)
			.get();
		const senderDoc = await admin.firestore().doc(`Users/${senderId}`).get();

		const receiverInfo = receiverDoc.data();
		const senderInfo = senderDoc.data();

		const expoPushToken = receiverInfo?.pushToken;
		if (!expoPushToken) return;

		// 유저가 채팅방에 들어와있는 경우 채팅 알림 발생 X
		if (receiverInfo?.activeChatRoomId === chatId) return;

		const messagePayload = {
			to: expoPushToken,
			title: '💬 새로운 채팅 메세지가 왔어구리!',
			body: `${senderInfo?.displayName}: ${
				body.length > 50 ? body.substring(0, 50) + '...' : body
			}`,
			data: {
				url: `animal-crossing-trading-app://chat/${chatId}`,
			},
		};

		try {
			await axios.post('https://exp.host/--/api/v2/push/send', messagePayload, {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} catch (e) {
			console.error(e);
		}
	},
);

export const onNotificationCreated = onDocumentCreated(
	'Notifications/{notificationId}',
	async (event) => {
		const notification = event.data?.data();
		if (!notification) return;

		const { receiverId, senderId, type, postId, body } = notification;
		if (!receiverId || !senderId || !body) return;

		const receiverDoc = await admin
			.firestore()
			.doc(`Users/${receiverId}`)
			.get();
		const postDoc = await admin.firestore().doc(`${type}/${postId}`).get();
		if (!receiverDoc.exists || !postDoc.exists) return;

		const receiverInfo = receiverDoc.data();
		const post = postDoc.data();

		const expoPushToken = receiverInfo?.pushToken;
		if (!expoPushToken) return;

		const messagePayload = {
			to: expoPushToken,
			title: `📝 새로운 댓글이 달렸어구리!`,
			body: `[${
				post?.title.length > 5
					? `${post?.title.substring(0, 5)}...`
					: post?.title
			}] ${body.length > 50 ? body.substring(0, 50) + '...' : body}`,
			// title: `[${collectionName}] ${senderInfo?.displayName}님이 ${post?.title}에 댓글을 남겼습니다.`,
			// body: body.length > 50 ? body.substring(0, 50) + '...' : body,
			data: {
				url: `animal-crossing-trading-app://post/${type}/${postId}/${event.params.notificationId}`,
			},
		};

		try {
			await axios.post('https://exp.host/--/api/v2/push/send', messagePayload, {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} catch (e) {
			console.error(e);
		}
	},
);

export const onCommentCreated = onDocumentCreated(
	'{collection}/{postId}/Comments/{commentId}',
	async (event) => {
		const { collection, postId } = event.params;
		const postRef = admin.firestore().doc(`${collection}/${postId}`);
		try {
			await postRef.update({
				commentCount: admin.firestore.FieldValue.increment(1),
			});
		} catch (e) {
			console.error(
				`onCommentCreated: 댓글 수 증가 실패 ${collection}/${postId}`,
				e,
			);
		}
	},
);

export const onCommentDeleted = onDocumentDeleted(
	'{collection}/{postId}/Comments/{commentId}',
	async (event) => {
		const { collection, postId } = event.params;
		const postRef = admin.firestore().doc(`${collection}/${postId}`);
		try {
			await postRef.update({
				commentCount: admin.firestore.FieldValue.increment(-1),
			});
		} catch (e) {
			console.error(
				`onCommentDeleted: 댓글 수 감소 실패 ${collection}/${postId}`,
				e,
			);
		}
	},
);

export const updateUserReport = onDocumentCreated(
	'Reports/{reportId}',
	async (event) => {
		const snapshot = event.data;
		if (!snapshot) return;

		const report = snapshot.data();
		const { reporteeId } = report;
		if (!reporteeId) return;

		try {
			// 유저 정보 가져오기
			const userDocRef = db.collection('Users').doc(reporteeId);
			const userSnap = await userDocRef.get();
			if (!userSnap.exists) return;

			const userInfo = userSnap.data();
			const userReport = userInfo?.report ?? {
				total: 0,
				suspendUntil: null,
				needsAdminReview: false,
			};

			let total = userReport.total + 1; // 기존 신고 누적 수 +1
			let suspendUntil = userReport.suspendUntil; // 기존 정지 기간
			let needsAdminReview = false; // 관리자 확인 플래그 (기본 false)

			// 최근 7일 이내, 30일 이내 해당 유저가 신고당한 횟수 조회
			const now = Date.now();
			const sevenDaysAgo = Timestamp.fromDate(
				new Date(now - 7 * 24 * 60 * 60 * 1000),
			);
			const thirtyDaysAgo = Timestamp.fromDate(
				new Date(now - 30 * 24 * 60 * 60 * 1000),
			);

			const recent7DaysReportsSnap = await db
				.collection('Reports')
				.where('reporteeId', '==', reporteeId)
				.where('createdAt', '>=', sevenDaysAgo)
				.get();

			const recent30DaysReportsSnap = await db
				.collection('Reports')
				.where('reporteeId', '==', reporteeId)
				.where('createdAt', '>=', thirtyDaysAgo)
				.get();

			const recent7Days = recent7DaysReportsSnap.size;
			const recent30Days = recent30DaysReportsSnap.size;

			// 기존 suspendUntil을 millis로 변환 (null일 경우 0)
			const suspendMillis = suspendUntil?.toMillis?.() || 0;
			let newSuspendMillis = suspendMillis;

			if (recent30Days >= 7) {
				// 최근 30일 신고 7회 이상 → 30일 정지 + 관리자 플래그
				newSuspendMillis = Math.max(
					suspendMillis,
					now + 30 * 24 * 60 * 60 * 1000,
				);
				needsAdminReview = true;
			} else if (recent7Days >= 3) {
				// 최근 7일 신고 3회 이상 → 7일 정지
				newSuspendMillis = Math.max(
					suspendMillis,
					now + 7 * 24 * 60 * 60 * 1000,
				);
			}

			// 더 나중 값으로 갱신
			if (newSuspendMillis > suspendMillis) {
				suspendUntil = Timestamp.fromMillis(newSuspendMillis);
			}

			// 유저 도큐먼트 업데이트
			await userDocRef.set(
				{
					report: {
						total,
						recent30Days,
						suspendUntil,
						...(needsAdminReview ? { needsAdminReview: true } : {}),
					},
				},
				{ merge: true },
			);
		} catch (e) {
			console.error(e);
		}
	},
);

export const updateUserReview = onDocumentCreated(
	'Reviews/{reviewId}',
	async (event) => {
		const snapshot = event.data;

		if (!snapshot) return;

		const review = snapshot.data();
		const { receiverId, value } = review;

		if (!receiverId) return;

		try {
			// 유저 정보 가져오기
			const userDocRef = db.collection('Users').doc(receiverId);
			const userSnap = await userDocRef.get();

			if (!userSnap.exists) return;

			const userInfo = userSnap.data();
			const userReview = userInfo?.review || {
				total: 0,
				positive: 0,
				negative: 0,
				badgeGranted: false,
			};

			const total = userReview.total + 1;
			const positive = userReview.positive + (value === 1 ? 1 : 0);
			const negative = userReview.negative + (value === -1 ? 1 : 0);
			const badgeGranted = total >= 10 && positive / total >= 0.8; // 뱃지 부여 조건: total >= 10, 긍정 비율 ≥ 80%

			// 유저 도큐먼트 업데이트
			await userDocRef.update({
				review: {
					total,
					positive,
					negative,
					badgeGranted,
				},
			});
		} catch (e) {
			console.error(e);
		}
	},
);

export const onBlockUser = onDocumentCreated(
	'Users/{userId}/BlockedUsers/{blockedUserId}',
	async (event) => {
		const { userId, blockedUserId } = event.params;

		const snapshot = event.data;
		if (!snapshot) return;

		const { blockedAt } = snapshot.data();

		try {
			await db
				.collection('Users')
				.doc(blockedUserId)
				.collection('BlockedBy')
				.doc(userId)
				.set(
					{
						id: userId,
						blockedAt,
					},
					{ merge: true },
				);
		} catch (e) {
			console.error(e);
		}
	},
);

export const onUnblockUser = onDocumentDeleted(
	'Users/{userId}/BlockedUsers/{blockedUserId}',
	async (event) => {
		const { userId, blockedUserId } = event.params;

		try {
			await db
				.collection('Users')
				.doc(blockedUserId)
				.collection('BlockedBy')
				.doc(userId)
				.delete();
		} catch (e) {
			console.error(e);
		}
	},
);

export const deleteUserAndArchive = functions.https.onCall(async (request) => {
	const {
		data: { uid },
	} = request;

	if (!uid) {
		throw new functions.https.HttpsError(
			'invalid-argument',
			'uid 파라미터가 누락되었습니다.',
		);
	}

	try {
		const userSnap = await db.collection('Users').doc(uid).get();
		if (!userSnap.exists) {
			throw new functions.https.HttpsError(
				'not-found',
				'존재하지 않는 유저입니다.',
			);
		}
		const userData = userSnap.data();

		// 1. Auth: 사용자 삭제
		await admin.auth().deleteUser(uid);

		// 2. Firestore: Users 삭제 & DeletedUsers로 이동
		const batch = db.batch();

		const deletedRef = db.collection('DeletedUsers').doc(uid);
		batch.set(deletedRef, {
			...userData,
			deletedAt: Timestamp.now(),
		});

		const userRef = db.collection('Users').doc(uid);
		batch.delete(userRef);

		await batch.commit();

		return { message: '유저 삭제에 성공했습니다.' };
	} catch (e: any) {
		console.error(`유저 ${uid} 삭제 실패:`, e);
		throw new functions.https.HttpsError(
			'internal',
			'유저 삭제 중 오류가 발생했습니다.',
			e.message,
		);
	}
});

import axios from 'axios';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

admin.initializeApp();
const db = admin.firestore();

export const getFirebaseToken = functions.https.onRequest(
	async (req: any, res: any) => {
		try {
			const { oauthType, accessToken } = req.body;

			if (!accessToken) {
				return res.status(400).json({ error: 'Access token이 필요합니다.' });
			}

			if (oauthType === 'kakao') {
				const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				const kakaoId = data.id;
				const email = data.kakao_account.email;
				const nickname = data.kakao_account.profile?.nickname;

				const firebaseUid = `kakao_${kakaoId}`;

				// Firebase에서 사용자 ID로 커스텀 토큰 생성
				const customToken = await admin.auth().createCustomToken(firebaseUid);

				return res.json({
					firebaseToken: customToken,
					user: {
						email,
						nickname,
					},
				});
			} else if (oauthType === 'naver') {
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

				const { id, email, nickname } = data.response;

				const firebaseUid = `naver_${id}`;

				const customToken = await admin.auth().createCustomToken(firebaseUid);

				return res.json({
					firebaseToken: customToken,
					user: {
						email,
						nickname,
					},
				});
			}
		} catch (error) {
			console.error('Firebase Custom Token 생성 실패:', error);
			return res.status(500).json({ error: 'Firebase Custom Token 생성 실패' });
		}
	},
);

export const sendChatNotification = onDocumentCreated(
	'Chats/{chatId}/Messages/{messageId}',
	async (event) => {
		const snapshot = event.data;

		if (!snapshot) return;

		const message = snapshot.data();
		const { receiverId, senderId, body } = message;

		// 시스템 메세지는 채팅 알림 발생 X
		if (senderId === 'system' || !senderId || !receiverId || !body) return;

		const receiverDoc = await admin
			.firestore()
			.doc(`Users/${receiverId}`)
			.get();
		const senderDoc = await admin.firestore().doc(`Users/${senderId}`).get();

		const receiverInfo = receiverDoc.data();
		const senderInfo = senderDoc.data();

		const expoPushToken = receiverInfo?.pushToken;
		if (!expoPushToken) return;

		const chatId = event.params.chatId;

		// 유저가 채팅방에 들어와있는 경우 채팅 알림 발생 X
		if (receiverInfo?.activeChatRoomId === chatId) return;

		const messagePayload = {
			to: expoPushToken,
			title: '💬 새로운 채팅 메세지가 왔어구리!',
			body: `${senderInfo?.displayName}: ${
				body.length > 50 ? body.substring(0, 50) + '...' : body
			}`,
			// title: `${senderInfo?.displayName}님으로부터 새 메시지`,
			// body: body.length > 50 ? body.substring(0, 50) + '...' : body,
			data: {
				url: `animal-crossing-trading-app://chat/room/${chatId}`,
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

export const sendCommentNotification = onDocumentCreated(
	'Notifications/{notificationId}',
	async (event) => {
		const snapshot = event.data;

		if (!snapshot) return;

		const notification = snapshot.data();
		const { receiverId, senderId, type, postId, body } = notification;

		if (!receiverId || !senderId || !body) return;

		const receiverDoc = await admin
			.firestore()
			.doc(`Users/${receiverId}`)
			.get();
		// const senderDoc = await admin.firestore().doc(`Users/${senderId}`).get();
		const postDoc = await admin.firestore().doc(`${type}/${postId}`).get();

		if (!postDoc.exists) return;

		const receiverInfo = receiverDoc.data();
		// const senderInfo = senderDoc.data();
		const post = postDoc.data();

		const expoPushToken = receiverInfo?.pushToken;
		if (!expoPushToken) return;

		// const collectionName = type === 'Boards' ? '마켓' : '커뮤니티';
		const path = type === 'Boards' ? 'home' : 'community';

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
				url: `animal-crossing-trading-app://${path}/post/${postId}`,
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
			const sevenDaysAgo = admin.firestore.Timestamp.fromDate(
				new Date(now - 7 * 24 * 60 * 60 * 1000),
			);
			const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
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
				suspendUntil = admin.firestore.Timestamp.fromMillis(newSuspendMillis);
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

export const archivePostsOfDeletedUser = onDocumentCreated(
	'DeletedUsers/{docId}',
	async (event) => {
		const snapshot = event.data;
		if (!snapshot) return;

		const user = snapshot.data();
		const { uid } = user;

		if (!uid) return;

		try {
			const collections = ['Boards', 'Communities'];

			const batch = db.batch();

			for (const col of collections) {
				const querySnapshot = await db
					.collection(col)
					.where('creatorId', '==', uid)
					.get();

				querySnapshot.forEach((doc) => {
					const docRef = db.collection(col).doc(doc.id);
					batch.update(docRef, { isDeleted: true });
				});
			}

			await batch.commit();
		} catch (e) {
			console.error(e);
		}
	},
);

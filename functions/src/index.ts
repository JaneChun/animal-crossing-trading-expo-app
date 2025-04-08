import axios from 'axios';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

admin.initializeApp();

export const getFirebaseToken = functions.https.onRequest(
	async (req: any, res: any) => {
		try {
			// 요청에서 accessToken 가져오기
			const { accessToken } = req.body;

			if (!accessToken) {
				return res.status(400).json({ error: 'Access token이 필요합니다.' });
			}

			// 네이버 사용자 정보 요청
			const { data } = await axios.get('https://openapi.naver.com/v1/nid/me', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (data.resultcode !== '00') {
				throw new Error('네이버 사용자 정보 조회 실패');
			}

			const { id, email, nickname } = data.response;

			// Firebase에서 사용자 ID로 커스텀 토큰 생성
			const customToken = await admin.auth().createCustomToken(id, {
				email,
				displayName: nickname,
			});

			return res.json({ firebaseToken: customToken });
		} catch (error) {
			console.error('Firebase 토큰 생성 실패:', error);
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

		if (!receiverId || !senderId || !body) return;

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

		const messagePayload = {
			to: expoPushToken,
			title: `${senderInfo?.displayName}님으로부터 새 메시지`,
			body: body.length > 50 ? body.substring(0, 50) + '...' : body,
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
		const senderDoc = await admin.firestore().doc(`Users/${senderId}`).get();
		const postDoc = await admin.firestore().doc(`${type}/${postId}`).get();

		if (!postDoc.exists) return;

		const receiverInfo = receiverDoc.data();
		const senderInfo = senderDoc.data();
		const post = postDoc.data();

		const expoPushToken = receiverInfo?.pushToken;
		if (!expoPushToken) return;

		const collectionName = type === 'Boards' ? '마켓' : '커뮤니티';
		const path = type === 'Boards' ? 'home' : 'community';

		const messagePayload = {
			to: expoPushToken,
			title: `[${collectionName}] ${senderInfo?.displayName}님이 ${post?.title}에 댓글을 남겼습니다.`,
			body: body.length > 50 ? body.substring(0, 50) + '...' : body,
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

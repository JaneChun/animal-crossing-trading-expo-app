import { db, truncateText } from '../utils/common';
import { sendPushNotification } from '../utils/pushNotification';

interface ReplyNotification {
	receiverId: string;
	senderId: string;
	type: 'Boards' | 'Communities';
	postId: string;
	body: string;
}

/**
 * 답글 알림 푸시 전송
 * @param notification - 알림 데이터
 * @param notificationId - 알림 ID
 */
export async function handleReplyNotification(
	notification: ReplyNotification,
	notificationId: string,
): Promise<void> {
	const { receiverId, senderId, type, postId, body } = notification;

	if (!receiverId || !senderId || !body) {
		return;
	}

	try {
		// 사용자 정보와 게시글 정보 조회
		const [receiverDoc, postDoc] = await Promise.all([
			db.doc(`Users/${receiverId}`).get(),
			db.doc(`${type}/${postId}`).get(),
		]);

		if (!receiverDoc.exists || !postDoc.exists) {
			return;
		}

		const receiverInfo = receiverDoc.data();
		const post = postDoc.data();

		const expoPushToken = receiverInfo?.pushToken;
		if (!expoPushToken) return;

		const postTitle = post?.title || '';
		const truncatedTitle = postTitle.length > 5 ? `${postTitle.substring(0, 5)}...` : postTitle;

		await sendPushNotification({
			to: expoPushToken,
			title: '💬 새로운 답글이 달렸어구리!',
			body: `[${truncatedTitle}] ${truncateText(body, 50)}`,
			data: {
				url: `animal-crossing-trading-app://post/${type}/${postId}/${notificationId}`,
			},
		});
	} catch (error) {
		console.error('Reply notification failed:', error);
	}
}

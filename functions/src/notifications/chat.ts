import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db, getSafeUid, truncateText } from '../utils/common';
import { sendPushNotification } from '../utils/pushNotification';

interface ChatMessage {
	receiverId: string;
	senderId: string;
	body: string;
}

/**
 * 채팅방 정보 업데이트 (최근 메시지, 보낸 사람, 시간)
 * @param chatId - 채팅방 ID
 * @param message - 메시지 데이터
 */
async function updateChatRoom(
	chatId: string,
	message: ChatMessage,
): Promise<void> {
	const chatRef = db.collection('Chats').doc(chatId);

	try {
		await chatRef.update({
			lastMessage: message.body,
			lastMessageSenderId: message.senderId,
			updatedAt: Timestamp.now(),
			[`unreadCount.${getSafeUid(message.receiverId)}`]:
				FieldValue.increment(1),
			visibleTo: FieldValue.arrayUnion(message.receiverId),
		});
	} catch (error) {
		console.error(`채팅방 정보 업데이트 실패`, error);
	}
}

/**
 * 채팅 메시지 푸시 알림 전송
 * @param chatId - 채팅방 ID
 * @param message - 메시지 데이터
 */
async function sendChatNotification(
	chatId: string,
	message: ChatMessage,
): Promise<void> {
	const { receiverId, senderId, body } = message;

	// 사용자 정보 조회
	const [receiverDoc, senderDoc] = await Promise.all([
		db.doc(`Users/${receiverId}`).get(),
		db.doc(`Users/${senderId}`).get(),
	]);

	const receiverInfo = receiverDoc.data();
	const senderInfo = senderDoc.data();

	const expoPushToken = receiverInfo?.pushToken;
	if (!expoPushToken) return;

	// 유저가 채팅방에 들어와있는 경우 채팅 알림 발생 X
	if (receiverInfo?.activeChatRoomId === chatId) return;

	await sendPushNotification({
		to: expoPushToken,
		title: '💬 새로운 채팅 메세지가 왔어구리!',
		body: `${senderInfo?.displayName}: ${truncateText(body, 50)}`,
		data: {
			url: `animal-crossing-trading-app://chat/${chatId}`,
		},
	});
}

/**
 * 채팅 메시지 생성 시 처리하는 메인 함수
 * @param chatId - 채팅방 ID
 * @param message - 메시지 데이터
 */
export async function handleChatMessageCreated(
	chatId: string,
	message: ChatMessage,
): Promise<void> {
	const { receiverId, senderId, body } = message;

	// 시스템, 리뷰 작성 메세지는 제외
	if (
		senderId === 'system' ||
		senderId === 'review' ||
		!senderId ||
		!receiverId ||
		!body
	) {
		return;
	}

	try {
		// 채팅방 정보 업데이트와 푸시 알림을 병렬로 처리
		await Promise.all([
			updateChatRoom(chatId, message),
			sendChatNotification(chatId, message),
		]);
	} catch (error) {
		console.error('채팅 알림 처리 중 오류가 발생했습니다:', error);
	}
}

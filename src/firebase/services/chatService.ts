import { db } from '@/config/firebase';
import {
	Chat,
	ChatWithReceiverInfo,
	CreateChatRoomParams,
	LeaveChatRoomParams,
	MarkMessageAsReadParams,
	SendChatMessageParams,
} from '@/types/chat';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { sanitize } from '@/utilities/sanitize';
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	Timestamp,
	updateDoc,
	where,
	writeBatch,
} from 'firebase/firestore';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';
import { getPublicUserInfos } from './userService';

export const generateChatId = (user1: string, user2: string): string => {
	return [user1, user2].sort().join('_');
};

export const getReceiverId = ({ chatId, userId }: { chatId: string; userId: string }) => {
	return chatId.split('_').find((id) => id !== userId);
};

export const populateReceiverInfo = async (
	chats: Chat[],
	userId: string,
): Promise<ChatWithReceiverInfo[]> => {
	if (chats.length === 0) return [];

	const uniqueReceiverIds: string[] = chats
		.map((item) => item.participants.find((uid) => uid !== userId))
		.filter(Boolean) as string[];

	const publicUserInfos: Record<string, PublicUserInfo> =
		await getPublicUserInfos(uniqueReceiverIds);

	return chats.map((item) => {
		const receiverId = item.participants.find((uid) => uid !== userId) ?? null;

		let receiverInfo = getDefaultUserInfo(receiverId!);

		if (receiverId && publicUserInfos[receiverId]) {
			receiverInfo = publicUserInfos[receiverId];
		}

		return {
			...item,
			receiverInfo: {
				uid: receiverId,
				displayName: receiverInfo.displayName,
				islandName: receiverInfo.islandName,
				photoURL: receiverInfo.photoURL,
			},
		};
	}) as ChatWithReceiverInfo[];
};

export const createChatRoom = async ({
	collectionName,
	postId,
	user1,
	user2,
}: CreateChatRoomParams): Promise<string | undefined> => {
	return firestoreRequest('채팅방 생성', async () => {
		const chatId = generateChatId(user1, user2);

		const chatRef = doc(db, 'Chats', chatId);
		const chatSnap = await getDoc(chatRef);

		// 🔹 채팅방이 존재하지 않으면 새로 생성
		if (!chatSnap.exists()) {
			const newChat: Chat = {
				id: chatId,
				participants: [user1, user2],
				lastMessage: '',
				lastMessageSenderId: '',
				unreadCount: {},
				updatedAt: Timestamp.now(),
				visibleTo: [user1, user2],
			};

			await setDoc(chatRef, newChat);

			console.log(`새 채팅방 생성: ${chatId}`);
		} else {
			const participants = chatSnap.data().participants;

			// 🔸 기존 채팅방이 있고, 내가 나간 상태였다면 다시 참가 처리
			if (!participants.includes(user1)) {
				await rejoinChatRoom({ chatId });
			} else {
				console.log(`기존 채팅방 사용: ${chatId}`);
			}
		}

		// 해당 게시글의 chatRoomIds 배열에 채팅방 ID 추가
		const postRef = doc(db, collectionName, postId);
		await updateDoc(postRef, {
			chatRoomIds: arrayUnion(chatId),
		});

		return chatId;
	});
};

const rejoinChatRoom = async ({ chatId }: { chatId: string }): Promise<void> => {
	return firestoreRequest('채팅방 재입장', async () => {
		const chatRef = doc(db, 'Chats', chatId);
		const chatDoc = await getDoc(chatRef);

		if (!chatDoc.exists()) {
			return;
		}

		const participants = chatDoc.data().participants;

		await updateDoc(chatRef, {
			visibleTo: arrayUnion(...participants),
		});
	});
};

export const sendMessage = async ({
	chatId,
	senderId,
	receiverId,
	message,
	imageUrl,
}: SendChatMessageParams): Promise<void> => {
	return firestoreRequest('메세지 전송', async () => {
		if (!chatId || !senderId || !receiverId) return;
		if (!message.trim() && !imageUrl) return;

		const messageRef = collection(db, 'Chats', chatId, 'Messages');

		// 유저 메세지만 필터링 (시스템 메세지는 X)
		const cleanMessage =
			senderId === 'system' || senderId === 'review' ? message : sanitize(message);

		const messageData: Record<string, unknown> = {
			body: cleanMessage,
			senderId,
			receiverId,
			createdAt: Timestamp.now(),
			isReadBy: [senderId],
		};

		if (imageUrl) {
			messageData.imageUrl = imageUrl;
		}

		await addDoc(messageRef, messageData);
	});
};

export const leaveChatRoom = async ({ chatId, userId }: LeaveChatRoomParams): Promise<void> => {
	return firestoreRequest('채팅방 나가기', async () => {
		const chatRef = doc(db, 'Chats', chatId);

		await updateDoc(chatRef, {
			visibleTo: arrayRemove(userId),
		});
	});
};

export const markMessagesAsRead = async ({
	chatId,
	userId,
}: MarkMessageAsReadParams): Promise<void> => {
	return firestoreRequest('메세지 읽음 처리', async () => {
		const messagesRef = collection(db, `Chats/${chatId}/Messages`);

		// 0. 안 읽은 메시지만 가져오기
		const q = query(messagesRef, where('isReadBy', 'not-in', [userId]));
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return;

		const batch = writeBatch(db);

		// 1. 메세지별 읽음 처리
		querySnapshot.docs.forEach((messageDoc) => {
			const messageRef = doc(db, `Chats/${chatId}/Messages/${messageDoc.id}`);
			batch.update(messageRef, {
				isReadBy: arrayUnion(userId), // 내가 읽었다고 추가
			});
		});

		// 2. 채팅방 정보도 업데이트 (내 unreadCount 초기화)
		const chatRef = doc(db, `Chats/${chatId}`);
		batch.update(chatRef, {
			[`unreadCount.${getSafeUid(userId)}`]: 0,
		});

		await batch.commit();
	});
};

export const getSafeUid = (uid: string) => {
	return uid.replace(/\./g, '');
};

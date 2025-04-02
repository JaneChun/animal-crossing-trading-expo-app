import { Notification } from '@/types/notification';
import { PublicUserInfo } from '@/types/user';
import { getDocs, Query } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import { updateDocToFirestore } from '../core/firestoreService';
import { getPublicUserInfos } from './userService';

export const fetchMyNotifications = async <T extends Notification, U>(
	q: Query,
	userId: string,
) => {
	return firestoreRequest('알림 조회', async () => {
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return { data: [] };

		const data: T[] = querySnapshot.docs.map((doc) => {
			const docData = doc.data();
			return {
				id: doc.id,
				...docData,
			} as unknown as T;
		});

		const uniqueSenderIds: string[] = [
			...new Set(data.map((item) => item.senderId)),
		];

		const publicUserInfos: Record<string, PublicUserInfo> =
			await getPublicUserInfos(uniqueSenderIds);

		const populatedData: U[] = data.map((item) => {
			const senderId = item.senderId;

			let senderInfo = {
				uid: senderId,
				displayName: '탈퇴한 사용자',
				islandName: '무인도',
				photoURL: '',
			};

			if (senderId && publicUserInfos[senderId]) {
				senderInfo = publicUserInfos[senderId];
			}

			return {
				...item,
				senderInfo: {
					uid: senderId,
					displayName: senderInfo.displayName,
					islandName: senderInfo.islandName,
					photoURL: senderInfo.photoURL,
				},
			} as U;
		});

		return {
			data: populatedData,
		};
	});
};

export const markNotificationAsRead = async (
	notificationId: string,
): Promise<void> => {
	return firestoreRequest('알림 읽음 처리', async () => {
		await updateDocToFirestore({
			id: notificationId,
			collection: 'Notifications',
			requestData: {
				isRead: true,
			},
		});
	});
};

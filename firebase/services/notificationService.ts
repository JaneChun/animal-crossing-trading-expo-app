import { db } from '@/fbase';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { doc, getDocs, Query, writeBatch } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import {
	deleteDocFromFirestore,
	updateDocToFirestore,
} from '../core/firestoreService';
import { getPublicUserInfos } from './userService';

export const fetchAndPopulateSenderInfo = async <
	T extends { senderId: string },
	U,
>(
	q: Query,
) => {
	return firestoreRequest('알림 조회', async () => {
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return { data: [] };

		const data: T[] = querySnapshot.docs.map((doc) => {
			const docData = doc.data();
			const id = doc.id;

			return {
				id,
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

			let senderInfo = getDefaultUserInfo(senderId);

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

export const markAllNotificationAsRead = async (
	notificationIds: string[],
): Promise<void> => {
	return firestoreRequest('알림 읽음 처리', async () => {
		const batch = writeBatch(db);

		notificationIds.forEach((notificationId) => {
			const noticeRef = doc(db, `Notifications/${notificationId}`);

			batch.update(noticeRef, { isRead: true });
		});

		await batch.commit();
	});
};

export const deleteNotification = async (
	notificationId: string,
): Promise<void> => {
	return firestoreRequest('알림 읽음 처리', async () => {
		await deleteDocFromFirestore({
			id: notificationId,
			collection: 'Notifications',
		});
	});
};

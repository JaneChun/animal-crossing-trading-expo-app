import { db } from '@/config/firebase';
import { Notification, PopulatedNotification } from '@/types/notification';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { doc, writeBatch } from 'firebase/firestore';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';
import { deleteDocFromFirestore, updateDocToFirestore } from '@/firebase/core/firestoreService';
import { getPosts } from './postService';
import { getCachedPublicUserInfos } from './cachedUserService';
import { QueryClient } from '@tanstack/react-query';

export const populateSenderInfo = async ({
	notifications,
	queryClient,
}: {
	notifications: Notification[];
	queryClient: QueryClient;
}): Promise<PopulatedNotification[]> => {
	if (notifications.length === 0) return [];

	const postIds = [...new Set(notifications.map((i) => i.postId))];
	const senderIds = [...new Set(notifications.map((i) => i.senderId))];

	// 게시글 정보, 유저 정보 불러와서 매칭
	const [postDetails, publicUserInfos] = await Promise.all([
		getPosts(postIds),
		getCachedPublicUserInfos({ userIds: senderIds, queryClient }),
	]);

	const populatedData = notifications.map((item) => {
		const postInfo = postDetails[item.postId] ?? undefined;
		const senderInfo = publicUserInfos[item.senderId] ?? getDefaultUserInfo(item.senderId);

		return {
			...item,
			postInfo,
			senderInfo,
		};
	});

	// 삭제된 게시글은 필터링
	return populatedData.filter((n) => n.postInfo !== undefined);
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
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

export const markAllNotificationAsRead = async (notificationIds: string[]): Promise<void> => {
	return firestoreRequest('전체 알림 읽음 처리', async () => {
		const batch = writeBatch(db);

		notificationIds.forEach((notificationId) => {
			const noticeRef = doc(db, `Notifications/${notificationId}`);

			batch.update(noticeRef, { isRead: true });
		});

		await batch.commit();
	});
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
	return firestoreRequest('알림 삭제 처리', async () => {
		await deleteDocFromFirestore({
			id: notificationId,
			collection: 'Notifications',
		});
	});
};

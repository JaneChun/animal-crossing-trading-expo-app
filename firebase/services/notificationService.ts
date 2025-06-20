import { db } from '@/fbase';
import { Collection, Post } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { doc, getDocs, Query, writeBatch } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import {
	deleteDocFromFirestore,
	updateDocToFirestore,
} from '../core/firestoreService';
import { getPosts } from './postService';
import { getPublicUserInfos } from './userService';

export const fetchAndPopulateSenderInfo = async <
	T extends { postId: string; senderId: string },
	U extends T & {
		postInfo: Post<Collection>;
		senderInfo: PublicUserInfo;
	},
>(
	q: Query,
): Promise<{ data: U[] }> => {
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

		const postIds = [...new Set(data.map((i) => i.postId))];
		const senderIds = [...new Set(data.map((i) => i.senderId))];

		// 게시글 정보, 유저 정보 불러와서 매칭
		const [postDetails, publicUserInfos] = await Promise.all([
			getPosts(postIds),
			getPublicUserInfos(senderIds),
		]);

		const populatedData = data.map((item) => {
			const postInfo = postDetails[item.postId] ?? undefined;
			const senderInfo =
				publicUserInfos[item.senderId] ?? getDefaultUserInfo(item.senderId);

			return {
				...item,
				postInfo,
				senderInfo,
			};
		});

		// 삭제된 게시글은 필터링
		return {
			data: populatedData.filter((n) => n.postInfo !== undefined) as U[],
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

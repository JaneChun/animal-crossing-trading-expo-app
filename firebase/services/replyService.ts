import { db } from '@/fbase';
import { Notification } from '@/types/notification';
import { Collection } from '@/types/post';
import { CreateReplyRequest, Reply, UpdateReplyRequest } from '@/types/reply';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { sanitize } from '@/utilities/sanitize';
import {
	collection,
	deleteDoc,
	doc,
	DocumentData,
	getDocs,
	Query,
	Timestamp,
	updateDoc,
	writeBatch,
} from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import { getDocFromFirestore } from '../core/firestoreService';
import { getPublicUserInfos } from './userService';

export const fetchAndPopulateUsers = async <T extends Reply, U>(q: Query<DocumentData>) => {
	return firestoreRequest('답글 조회', async () => {
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return { data: [], lastDoc: null };

		const data: T[] = querySnapshot.docs.map((doc) => {
			const docData = doc.data();
			const id = doc.id;

			return { id, ...docData } as unknown as T;
		});

		const uniqueCreatorIds: string[] = [...new Set(data.map((item) => item.creatorId))] as string[];

		const publicUserInfos: Record<string, PublicUserInfo> = await getPublicUserInfos(
			uniqueCreatorIds,
		);

		const populatedData: U[] = data.map((item) => {
			const userInfo = publicUserInfos[item.creatorId] || getDefaultUserInfo(item.creatorId);

			return {
				...item,
				creatorDisplayName: userInfo.displayName,
				creatorIslandName: userInfo.islandName,
				creatorPhotoURL: userInfo.photoURL,
			} as U;
		});

		return {
			data: populatedData,
			lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
		};
	});
};

export const createReply = async ({
	collectionName,
	postId,
	commentId,
	requestData,
	userId,
}: {
	collectionName: Collection;
	postId: string;
	commentId: string;
	requestData: CreateReplyRequest;
	userId: string;
}): Promise<void> => {
	return firestoreRequest('답글 작성', async () => {
		const batch = writeBatch(db);

		// 1. 답글 문서 추가
		const replyRef = doc(collection(db, collectionName, postId, 'Comments', commentId, 'Replies'));

		const cleanData: CreateReplyRequest = { ...requestData };
		cleanData.body = sanitize(cleanData.body);

		const newReply: Omit<Reply, 'id'> = {
			...cleanData,
			creatorId: userId,
			createdAt: Timestamp.now(),
		};

		batch.set(replyRef, newReply);

		// 2. 알림 문서 생성 - parentId의 작성자에게 알림
		const receiverId =
			requestData.parentId === commentId
				? await getCommentCreatorId(collectionName, postId, requestData.parentId)
				: await getReplyCreatorId(collectionName, postId, commentId, requestData.parentId);
		const senderId = userId;

		if (!receiverId) return;

		if (receiverId !== senderId) {
			const notificationRef = doc(collection(db, 'Notifications'));
			const newNotification: Omit<Notification, 'id'> = {
				receiverId,
				senderId,
				type: collectionName,
				actionType: 'reply', // 답글
				postId,
				body: requestData.body,
				createdAt: Timestamp.now(),
				isRead: false,
			};

			batch.set(notificationRef, newNotification);
		}

		await batch.commit();
	});
};

export const updateReply = async ({
	collectionName,
	postId,
	commentId,
	replyId,
	requestData,
}: {
	collectionName: Collection;
	postId: string;
	commentId: string;
	replyId: string;
	requestData: UpdateReplyRequest;
}): Promise<void> => {
	return firestoreRequest('답글 수정', async () => {
		const replyRef = doc(db, collectionName, postId, 'Comments', commentId, 'Replies', replyId);

		const cleanData: UpdateReplyRequest = { ...requestData };
		if (cleanData?.body) cleanData.body = sanitize(cleanData.body);

		await updateDoc(replyRef, {
			...cleanData,
			updatedAt: Timestamp.now(),
		});
	});
};

export const deleteReply = async (
	collectionName: Collection,
	postId: string,
	commentId: string,
	replyId: string,
): Promise<void> => {
	return firestoreRequest('답글 삭제', async () => {
		const replyRef = doc(db, collectionName, postId, 'Comments', commentId, 'Replies', replyId);
		await deleteDoc(replyRef);
	});
};

// Helper functions
const getCommentCreatorId = async (
	collectionName: Collection,
	postId: string,
	commentId: string,
): Promise<string | null> => {
	const commentDoc = await getDocFromFirestore({
		collection: `${collectionName}/${postId}/Comments`,
		id: commentId,
	});
	return commentDoc?.creatorId || null;
};

const getReplyCreatorId = async (
	collectionName: Collection,
	postId: string,
	commentId: string,
	replyId: string,
): Promise<string | null> => {
	const replyDoc = await getDocFromFirestore({
		collection: `${collectionName}/${postId}/Comments/${commentId}/Replies`,
		id: replyId,
	});
	return replyDoc?.creatorId || null;
};

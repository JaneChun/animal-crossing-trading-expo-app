import { db } from '@/fbase';
import {
	Comment,
	CreateCommentRequest,
	UpdateCommentRequest,
} from '@/types/comment';
import { Notification } from '@/types/notification';
import { Collection } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import {
	collection,
	doc,
	DocumentData,
	getDocs,
	increment,
	Query,
	Timestamp,
	updateDoc,
	writeBatch,
} from 'firebase/firestore';
import { Alert } from 'react-native';
import firestoreRequest from '../core/firebaseInterceptor';
import { getDocFromFirestore } from '../core/firestoreService';
import { getPublicUserInfos } from './userService';

export const fetchAndPopulateUsers = async <T extends Comment, U>(
	q: Query<DocumentData>,
) => {
	return firestoreRequest('댓글 조회', async () => {
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return { data: [], lastDoc: null };

		const data: T[] = querySnapshot.docs.map((doc) => {
			const docData = doc.data();
			const id = doc.id;

			return { id, ...docData } as unknown as T;
		});

		const uniqueCreatorIds: string[] = [
			...new Set(data.map((item) => item.creatorId)),
		] as string[];

		const publicUserInfos: Record<string, PublicUserInfo> =
			await getPublicUserInfos(uniqueCreatorIds);

		const populatedData: U[] = data.map((item) => {
			const userInfo =
				publicUserInfos[item.creatorId] || getDefaultUserInfo(item.creatorId);

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

export const createComment = async ({
	collectionName,
	postId,
	requestData,
	userId,
}: {
	collectionName: Collection;
	postId: string;
	requestData: CreateCommentRequest;
	userId: string;
}): Promise<void> => {
	return firestoreRequest('댓글 작성', async () => {
		const batch = writeBatch(db);

		// 1. 댓글 문서 추가
		const commentRef = doc(collection(db, collectionName, postId, 'Comments'));
		const newComment: Omit<Comment, 'id'> = {
			...requestData,
			creatorId: userId,
			createdAt: Timestamp.now(),
		};

		batch.set(commentRef, newComment);

		// 2. post 문서의 commentCount 필드 수정
		const postRef = doc(db, collectionName, postId);
		batch.update(postRef, { commentCount: increment(1) });

		// 3. notification 문서 생성
		const post = await getDocFromFirestore({
			collection: collectionName,
			id: postId,
		});

		if (!post) {
			Alert.alert('댓글 작성 실패', '게시글을 찾을 수 없습니다.');
			return;
		}

		const receiverId = post.creatorId;
		const senderId = userId;

		if (receiverId !== senderId) {
			const notificationRef = doc(collection(db, 'Notifications'));
			const newNotification: Omit<Notification, 'id'> = {
				receiverId,
				senderId,
				type: collectionName,
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

export const updateComment = async ({
	collectionName,
	postId,
	commentId,
	requestData,
}: {
	collectionName: Collection;
	postId: string;
	commentId: string;
	requestData: UpdateCommentRequest;
}): Promise<void> => {
	return firestoreRequest('댓글 수정', async () => {
		const commentRef = doc(db, collectionName, postId, 'Comments', commentId);
		await updateDoc(commentRef, {
			...requestData,
			updatedAt: Timestamp.now(),
		});
	});
};

export const deleteComment = async (
	collectionName: Collection,
	postId: string,
	commentId: string,
): Promise<void> => {
	return firestoreRequest('댓글 삭제', async () => {
		const batch = writeBatch(db);

		// 1. 댓글 문서 삭제
		const commentRef = doc(db, collectionName, postId, 'Comments', commentId);
		batch.delete(commentRef);

		// 2. post 문서의 commentCount 필드 수정
		const postRef = doc(db, collectionName, postId);
		batch.update(postRef, { commentCount: increment(-1) });

		await batch.commit();
	});
};

import { db } from '@/fbase';
import { addCommentRequest, updateCommentRequest } from '@/types/comment';
import { Collection } from '@/types/components';
import {
	collection,
	doc,
	increment,
	updateDoc,
	writeBatch,
} from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';

export const addComment = async ({
	collectionName,
	postId,
	requestData,
}: {
	collectionName: Collection;
	postId: string;
	requestData: addCommentRequest;
}): Promise<void> => {
	return firestoreRequest('댓글 작성', async () => {
		const batch = writeBatch(db);

		// 1. 댓글 문서 추가
		const commentRef = doc(collection(db, collectionName, postId, 'Comments'));
		batch.set(commentRef, requestData);

		// 2. post 문서의 commentCount 필드 수정
		const postRef = doc(db, collectionName, postId);
		batch.update(postRef, { commentCount: increment(1) });

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
	requestData: updateCommentRequest;
}): Promise<void> => {
	return firestoreRequest('댓글 수정', async () => {
		// 1. 댓글 문서 수정
		const commentRef = doc(db, collectionName, postId, 'Comments', commentId);
		await updateDoc(commentRef, requestData);
	});
};

export const deleteComment = async ({
	collectionName,
	postId,
	commentId,
}: {
	collectionName: Collection;
	postId: string;
	commentId: string;
}): Promise<void> => {
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

import { db } from '@/fbase';
import { addCommentRequest, updateCommentRequest } from '@/types/comment';
import {
	collection,
	doc,
	increment,
	updateDoc,
	writeBatch,
} from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';

export const addComment = async ({
	postId,
	requestData,
}: {
	postId: string;
	requestData: addCommentRequest;
}): Promise<void> => {
	return firestoreRequest('댓글 작성', async () => {
		const batch = writeBatch(db);

		// 1. 댓글 문서 추가
		const commentRef = doc(collection(db, 'Boards', postId, 'Comments'));
		batch.set(commentRef, requestData);

		// 2. post 문서의 commentCount 필드 수정
		const postRef = doc(db, 'Boards', postId);
		batch.update(postRef, { commentCount: increment(1) });

		await batch.commit();
	});
};

export const updateComment = async ({
	postId,
	commentId,
	requestData,
}: {
	postId: string;
	commentId: string;
	requestData: updateCommentRequest;
}): Promise<void> => {
	return firestoreRequest('댓글 수정', async () => {
		// 1. 댓글 문서 수정
		const commentRef = doc(db, 'Boards', postId, 'Comments', commentId);
		await updateDoc(commentRef, requestData);
	});
};

export const deleteComment = async ({
	postId,
	commentId,
}: {
	postId: string;
	commentId: string;
}): Promise<void> => {
	return firestoreRequest('댓글 삭제', async () => {
		const batch = writeBatch(db);

		// 1. 댓글 문서 삭제
		const commentRef = doc(db, 'Boards', postId, 'Comments', commentId);
		batch.delete(commentRef);

		// 2. post 문서의 commentCount 필드 수정
		const postRef = doc(db, 'Boards', postId);
		batch.update(postRef, { commentCount: increment(-1) });

		await batch.commit();
	});
};

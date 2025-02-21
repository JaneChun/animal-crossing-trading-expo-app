import { db } from '@/fbase';
import {
	collection,
	doc,
	increment,
	Timestamp,
	updateDoc,
	writeBatch,
} from 'firebase/firestore';
import firestoreRequest from './firebaseInterceptor';

export const addComment = async ({
	postId,
	commentData,
}: {
	postId: string;
	commentData: any;
}): Promise<void> => {
	return firestoreRequest('댓글 추가', async () => {
		const batch = writeBatch(db);

		// 1. 댓글 문서 추가
		const commentRef = doc(collection(db, 'Boards', postId, 'Comments')); // Boards/{postId}/Comments 서브컬렉션
		batch.set(commentRef, commentData);

		// 2. post 문서의 commentCount 필드 수정
		const postRef = doc(db, 'Boards', postId);
		batch.update(postRef, { commentCount: increment(1) });

		await batch.commit();
	});
};

export const updateComment = async ({
	postId,
	commentId,
	newCommentText,
}: {
	postId: string;
	commentId: string;
	newCommentText: string;
}): Promise<void> => {
	return firestoreRequest('댓글 수정', async () => {
		// 1. 댓글 문서 수정
		const commentRef = doc(db, 'Boards', postId, 'Comments', commentId);
		await updateDoc(commentRef, {
			body: newCommentText,
			updatedAt: Timestamp.now(),
		});
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

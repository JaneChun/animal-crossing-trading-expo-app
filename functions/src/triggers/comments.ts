import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../utils/common';

/**
 * 댓글 생성 시 게시글의 댓글 수 증가
 * @param collection - 컬렉션 이름
 * @param postId - 게시글 ID
 */
export async function handleCommentCreated(collection: string, postId: string): Promise<void> {
	const postRef = db.doc(`${collection}/${postId}`);

	try {
		await postRef.update({
			commentCount: FieldValue.increment(1),
		});
	} catch (error) {
		console.error(`댓글 수 증가 실패 ${collection}/${postId}`, error);
	}
}

/**
 * 댓글 삭제 시 게시글의 댓글 수 감소
 * @param collection - 컬렉션 이름
 * @param postId - 게시글 ID
 */
export async function handleCommentDeleted(collection: string, postId: string): Promise<void> {
	const postRef = db.doc(`${collection}/${postId}`);

	try {
		// 하드 삭제 스케줄러가 댓글을 batch delete할 때 이 트리거가 발동되므로,
		// 이미 소프트 삭제된 게시글이면 불필요한 commentCount 감소를 방지
		const postSnap = await postRef.get();
		if (!postSnap.exists || postSnap.data()?.status === 'deleted') return;

		await postRef.update({
			commentCount: FieldValue.increment(-1),
		});
	} catch (error) {
		console.error(`댓글 수 감소 실패 ${collection}/${postId}`, error);
	}
}

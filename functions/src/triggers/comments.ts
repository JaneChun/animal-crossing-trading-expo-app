import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../utils/common';

/**
 * 댓글 생성 시 게시글의 댓글 수 증가
 * @param collection - 컬렉션 이름
 * @param postId - 게시글 ID
 */
export async function handleCommentCreated(
	collection: string,
	postId: string,
): Promise<void> {
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
export async function handleCommentDeleted(
	collection: string,
	postId: string,
): Promise<void> {
	const postRef = db.doc(`${collection}/${postId}`);

	try {
		await postRef.update({
			commentCount: FieldValue.increment(-1),
		});
	} catch (error) {
		console.error(`댓글 수 감소 실패 ${collection}/${postId}`, error);
	}
}

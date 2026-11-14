import { DocumentData, DocumentReference, FieldValue } from 'firebase-admin/firestore';
import { db } from '../utils/common';

export interface ReportTargetData {
	collectionName?: string;
	postId?: string;
	commentId?: string;
	replyId?: string;
}

// 신고자가 collectionName을 임의로 쓸 수 있으므로, 공개 게시판 컬렉션만 읽는다
// 다른 컬렉션을 허용하면 신고자가 자기 신고 문서로 임의 문서의 title·body를 읽어 갈 수 있다
const SNAPSHOT_COLLECTIONS = ['Boards', 'Communities'];

/**
 * 신고 대상 게시글·댓글·답글 문서 전체를 복사한 스냅샷
 * 제목·본문뿐 아니라 이미지·거래 정보(cart)처럼 이후 수정될 수 있는 필드를 모두 보존한다
 * @param target - 신고 대상 필드
 * @returns 대상 문서 데이터. 게시글·댓글 신고가 아니거나 대상이 없으면 null
 */
export async function getReportSnapshot(target: ReportTargetData): Promise<DocumentData | null> {
	const { collectionName, postId, commentId, replyId } = target;
	if (!collectionName || !SNAPSHOT_COLLECTIONS.includes(collectionName) || !postId) {
		return null;
	}

	const postRef = db.collection(collectionName).doc(postId);

	if (commentId) {
		const commentRef = postRef.collection('Comments').doc(commentId);
		const targetRef = replyId ? commentRef.collection('Replies').doc(replyId) : commentRef;
		const targetSnap = await targetRef.get();
		return targetSnap.data() ?? null;
	}

	const postSnap = await postRef.get();
	return postSnap.data() ?? null;
}

/**
 * 신고 시점 스냅샷을 신고 문서에 기록
 * 앱(신고자)이 쓰면 내용을 조작할 수 있으므로 함수에서만 쓴다. 재신고로 대상이 바뀌어 스냅샷이 없으면 이전 값을 지운다
 * 이 쓰기는 createdAt을 바꾸지 않으므로 onReportWritten이 다시 처리하지 않는다
 * 조회에 실패해도 관리자 알림은 나가야 하므로 에러를 삼킨다
 * @param reportRef - 신고 문서
 * @param target - 신고 대상 필드
 */
export async function saveReportSnapshot(
	reportRef: DocumentReference,
	target: ReportTargetData,
): Promise<void> {
	try {
		const snapshot = await getReportSnapshot(target);
		await reportRef.update({ snapshot: snapshot ?? FieldValue.delete() });
	} catch (error) {
		console.error(`신고 스냅샷 기록 실패 (${reportRef.path}):`, error);
	}
}

import { HttpsError } from 'firebase-functions/v2/https';
import { Query, Timestamp } from 'firebase-admin/firestore';
import { db } from '../utils/common';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface DailyStats {
	date: string;
	posts: number;
	comments: number;
	replies: number;
	messages: number;
	signUps: number;
	reviews: number;
}

export interface UserStats {
	posts: number;
	comments: number;
	replies: number;
	chatRooms: number;
	messages: number;
	reportsFiled: number;
	blockedBy: number;
	blocking: number;
}

/**
 * 호출자가 관리자(Users.role == 'admin')인지 확인
 * @param uid - 호출자 UID
 */
export async function assertAdmin(uid: string | undefined): Promise<void> {
	if (!uid) {
		throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
	}

	const userSnap = await db.doc(`Users/${uid}`).get();
	if (userSnap.data()?.role !== 'admin') {
		throw new HttpsError('permission-denied', '관리자만 사용할 수 있습니다.');
	}
}

/**
 * KST 날짜(YYYY-MM-DD)의 0시~24시 범위
 * 실행 환경 타임존(Cloud Functions는 UTC)과 무관하게 고정 오프셋으로 계산한다
 * @param date - KST 기준 날짜
 * @returns 시작(포함)·끝(제외) 시각
 */
export function getKstDayRange(date: string): { start: Timestamp; end: Timestamp } {
	if (!DATE_PATTERN.test(date)) {
		throw new HttpsError('invalid-argument', '날짜는 YYYY-MM-DD 형식이어야 합니다.');
	}

	const [year, month, day] = date.split('-').map(Number);
	const startMs = Date.UTC(year, month - 1, day) - KST_OFFSET_MS;

	return {
		start: Timestamp.fromMillis(startMs),
		end: Timestamp.fromMillis(startMs + DAY_MS),
	};
}

const countOf = async (q: Query): Promise<number> => {
	const snapshot = await q.count().get();
	return snapshot.data().count;
};

/**
 * 하루(KST) 동안 생성된 게시글·댓글·답글·채팅 메시지·신규 가입·리뷰 수
 * 게시글은 이후 숨김·삭제 여부와 관계없이 센다
 * @param date - KST 기준 날짜 (YYYY-MM-DD)
 * @returns 일별 통계
 */
export async function getDailyStatsHandler(date: string): Promise<DailyStats> {
	const { start, end } = getKstDayRange(date);
	const inRange = (q: Query) => q.where('createdAt', '>=', start).where('createdAt', '<', end);

	const [boards, communities, comments, replies, messages, signUps, reviews] = await Promise.all([
		countOf(inRange(db.collection('Boards'))),
		countOf(inRange(db.collection('Communities'))),
		countOf(inRange(db.collectionGroup('Comments'))),
		countOf(inRange(db.collectionGroup('Replies'))),
		countOf(inRange(db.collectionGroup('Messages'))),
		countOf(inRange(db.collection('Users'))),
		countOf(inRange(db.collection('Reviews'))),
	]);

	return {
		date,
		posts: boards + communities,
		comments,
		replies,
		messages,
		signUps,
		reviews,
	};
}

/**
 * 유저 한 명의 전체 기간 활동·신고·차단 수
 * @param uid - 대상 유저 UID
 * @returns 유저별 통계
 */
export async function getUserStatsHandler(uid: string): Promise<UserStats> {
	if (!uid || typeof uid !== 'string') {
		throw new HttpsError('invalid-argument', 'uid가 필요합니다.');
	}

	const userRef = db.doc(`Users/${uid}`);

	const [
		boards,
		communities,
		comments,
		replies,
		chatRooms,
		messages,
		reportsFiled,
		blockedBy,
		blocking,
	] = await Promise.all([
		countOf(db.collection('Boards').where('creatorId', '==', uid)),
		countOf(db.collection('Communities').where('creatorId', '==', uid)),
		countOf(db.collectionGroup('Comments').where('creatorId', '==', uid)),
		countOf(db.collectionGroup('Replies').where('creatorId', '==', uid)),
		countOf(db.collection('Chats').where('participants', 'array-contains', uid)),
		countOf(db.collectionGroup('Messages').where('senderId', '==', uid)),
		countOf(db.collection('Reports').where('reporterId', '==', uid)),
		countOf(userRef.collection('BlockedBy')),
		countOf(userRef.collection('BlockedUsers')),
	]);

	return {
		posts: boards + communities,
		comments,
		replies,
		chatRooms,
		messages,
		reportsFiled,
		blockedBy,
		blocking,
	};
}

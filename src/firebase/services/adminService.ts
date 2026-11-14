import {
	collection,
	deleteField,
	doc,
	getDocs,
	increment,
	limit,
	orderBy,
	query,
	Query,
	startAfter,
	Timestamp,
	updateDoc,
	where,
	writeBatch,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { db, functions } from '@/config/firebase';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';
import { getDocFromFirestore } from '@/firebase/core/firestoreService';
import {
	AdminBlockRecord,
	DailyStats,
	ErrorLog,
	Paginated,
	UserBlockDirection,
	UserReportDirection,
	UserReviewDirection,
	UserStats,
} from '@/types/admin';
import { Message } from '@/types/chat';
import { Comment } from '@/types/comment';
import { Collection, Doc, Post, PostDoc } from '@/types/post';
import { Report } from '@/types/report';
import { ReviewWithId } from '@/types/review';
import { UserInfo } from '@/types/user';
import { toPost } from '@/utilities/toPost';

const PAGE_SIZE = 20;

const fetchPage = async <T>(baseQuery: Query, lastDoc: Doc): Promise<Paginated<T>> => {
	const pagedQuery = lastDoc
		? query(baseQuery, startAfter(lastDoc), limit(PAGE_SIZE))
		: query(baseQuery, limit(PAGE_SIZE));
	const snapshot = await getDocs(pagedQuery);

	const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as T);
	// 마지막 페이지면 커서를 null로 돌려 다음 페이지 요청을 멈춘다
	const nextCursor =
		snapshot.docs.length < PAGE_SIZE ? null : snapshot.docs[snapshot.docs.length - 1];

	return { data, lastDoc: nextCursor };
};

const toUserInfo = (user: UserInfo & { id: string }): UserInfo => {
	const { id, ...rest } = user;
	return { ...rest, uid: id };
};

// ── 조회 ──────────────────────────────────

export const fetchReports = async ({
	resolved,
	lastDoc,
}: {
	resolved: boolean;
	lastDoc: Doc;
}): Promise<Paginated<Report>> => {
	return firestoreRequest(
		'신고 목록 조회',
		() =>
			fetchPage<Report>(
				query(
					collection(db, 'Reports'),
					where('resolved', '==', resolved),
					orderBy('createdAt', 'desc'),
				),
				lastDoc,
			),
		{ throwOnError: true },
	);
};

export const fetchUserReports = async ({
	uid,
	direction,
	lastDoc,
}: {
	uid: string;
	direction: UserReportDirection;
	lastDoc: Doc;
}): Promise<Paginated<Report>> => {
	const userField = direction === 'received' ? 'reporteeId' : 'reporterId';

	return firestoreRequest(
		'유저별 신고 조회',
		() =>
			fetchPage<Report>(
				query(
					collection(db, 'Reports'),
					where(userField, '==', uid),
					orderBy('createdAt', 'desc'),
				),
				lastDoc,
			),
		{ throwOnError: true },
	);
};

export const fetchUserReviews = async ({
	uid,
	direction,
	lastDoc,
}: {
	uid: string;
	direction: UserReviewDirection;
	lastDoc: Doc;
}): Promise<Paginated<ReviewWithId>> => {
	const userField = direction === 'received' ? 'receiverId' : 'senderId';

	return firestoreRequest(
		'유저별 리뷰 조회',
		() =>
			fetchPage<ReviewWithId>(
				query(
					collection(db, 'Reviews'),
					where(userField, '==', uid),
					orderBy('createdAt', 'desc'),
				),
				lastDoc,
			),
		{ throwOnError: true },
	);
};

// 상대 유저 uid는 문서 id다. BlockedUsers 문서에는 id 필드가 없어 fetchPage가 붙이는 문서 id를 쓴다
export const fetchUserBlocks = async ({
	uid,
	direction,
	lastDoc,
}: {
	uid: string;
	direction: UserBlockDirection;
	lastDoc: Doc;
}): Promise<Paginated<AdminBlockRecord>> => {
	const subcollection = direction === 'blocking' ? 'BlockedUsers' : 'BlockedBy';

	return firestoreRequest(
		'유저별 차단 조회',
		() =>
			fetchPage<AdminBlockRecord>(
				query(collection(db, 'Users', uid, subcollection), orderBy('blockedAt', 'desc')),
				lastDoc,
			),
		{ throwOnError: true },
	);
};

export const fetchReport = async (reportId: string): Promise<Report | null> => {
	return firestoreRequest(
		'신고 조회',
		async () => {
			const docData = await getDocFromFirestore({ collection: 'Reports', id: reportId });
			return docData ? (docData as Report) : null;
		},
		{ throwOnError: true },
	);
};

export const fetchNeedsReviewUsers = async (lastDoc: Doc): Promise<Paginated<UserInfo>> => {
	return firestoreRequest(
		'검토 필요 유저 조회',
		async () => {
			const page = await fetchPage<UserInfo & { id: string }>(
				query(collection(db, 'Users'), where('report.needsAdminReview', '==', true)),
				lastDoc,
			);
			return { ...page, data: page.data.map(toUserInfo) };
		},
		{ throwOnError: true },
	);
};

export const fetchUsers = async (lastDoc: Doc): Promise<Paginated<UserInfo>> => {
	return firestoreRequest(
		'유저 목록 조회',
		async () => {
			// lastActiveAt이 없는 유저(배포 후 앱을 열지 않은 유저)는 결과에서 빠진다
			const page = await fetchPage<UserInfo & { id: string }>(
				query(collection(db, 'Users'), orderBy('lastActiveAt', 'desc')),
				lastDoc,
			);
			return { ...page, data: page.data.map(toUserInfo) };
		},
		{ throwOnError: true },
	);
};

export const fetchErrors = async (lastDoc: Doc): Promise<Paginated<ErrorLog>> => {
	return firestoreRequest(
		'에러 목록 조회',
		() =>
			fetchPage<ErrorLog>(
				query(collection(db, 'Errors'), orderBy('timestamp', 'desc')),
				lastDoc,
			),
		{ throwOnError: true },
	);
};

export interface ReportTargetContent {
	collectionName: Collection | null;
	post: Post<Collection> | null;
	comment: Comment | null; // 댓글 신고일 때만
}

// collectionName이 없는 기존 신고(이번 작업 이전 데이터)는 게시글이 있는 컬렉션을 Boards → Communities 순으로 찾는다
const findPostCollection = async (postId: string): Promise<Collection | null> => {
	const boardsPost = await getDocFromFirestore({ collection: 'Boards', id: postId });
	if (boardsPost) return 'Boards';

	const communitiesPost = await getDocFromFirestore({ collection: 'Communities', id: postId });
	if (communitiesPost) return 'Communities';

	return null;
};

// 신고 대상 게시글·댓글의 현재 상태. 원문 링크와 숨기기·숨김 해제 버튼을 정하는 데 쓴다
export const fetchReportTargetContent = async (report: Report): Promise<ReportTargetContent> => {
	return firestoreRequest(
		'신고 원문 조회',
		async () => {
			const { postId, commentId, replyId } = report;
			const emptyTarget = { collectionName: null, post: null, comment: null };

			// 채팅·프로필 신고
			if (!postId) return emptyTarget;

			const collectionName = report.collectionName ?? (await findPostCollection(postId));
			if (!collectionName) return emptyTarget;

			const postDoc = await getDocFromFirestore({ collection: collectionName, id: postId });
			const post = postDoc ? toPost(collectionName, postDoc as PostDoc<Collection>) : null;

			// 게시글 신고, 또는 답글 신고(답글은 숨기기를 지원하지 않아 댓글을 읽지 않는다)
			if (!commentId || replyId) return { collectionName, post, comment: null };

			// 댓글 신고
			const commentDoc = await getDocFromFirestore({
				collection: `${collectionName}/${postId}/Comments`,
				id: commentId,
			});
			const comment = commentDoc ? (commentDoc as Comment) : null;

			return { collectionName, post, comment };
		},
		{ throwOnError: true },
	);
};

// 신고된 채팅 메시지를 1회 조회한다. 실시간 구독과 읽음 처리를 하지 않는다
export const fetchReportedChatMessages = async (chatId: string): Promise<Message[]> => {
	return firestoreRequest(
		'신고된 채팅 조회',
		async () => {
			const snapshot = await getDocs(
				query(collection(db, 'Chats', chatId, 'Messages'), orderBy('createdAt', 'asc')),
			);
			return snapshot.docs.map(
				(docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Message,
			);
		},
		{ throwOnError: true },
	);
};

export const fetchDailyStats = async (date: string): Promise<DailyStats> => {
	const { data } = await httpsCallable<{ date: string }, DailyStats>(
		functions,
		'getDailyStats',
	)({ date });
	return data;
};

export const fetchUserStats = async (uid: string): Promise<UserStats> => {
	const { data } = await httpsCallable<{ uid: string }, UserStats>(
		functions,
		'getUserStats',
	)({ uid });
	return data;
};

// ── 변경 ──────────────────────────────────

export const setReportResolved = async ({
	reportId,
	resolved,
}: {
	reportId: string;
	resolved: boolean;
}): Promise<void> => {
	await firestoreRequest(
		'신고 처리 상태 변경',
		() => updateDoc(doc(db, 'Reports', reportId), { resolved }),
		{ throwOnError: true },
	);
};

// 정지를 풀고 정지 때 숨겨진 게시글 복구까지 함수(liftUserSuspension)에서 처리한다
export const liftSuspension = async (uid: string): Promise<void> => {
	await httpsCallable<{ uid: string }, void>(functions, 'liftSuspension')({ uid });
};

export const setPostHidden = async ({
	collectionName,
	postId,
	hidden,
}: {
	collectionName: Collection;
	postId: string;
	hidden: boolean;
}): Promise<void> => {
	await firestoreRequest(
		hidden ? '게시글 숨김' : '게시글 숨김 해제',
		async () => {
			const postRef = doc(db, collectionName, postId);

			if (hidden) {
				await updateDoc(postRef, { status: 'hidden', hiddenByAdmin: true });
				return;
			}

			// 작성자가 정지 중이면 관리자 숨김 표시만 지우고 숨김 상태는 유지한다.
			// 정지가 풀릴 때 복구(restoreUserPostsAfterSuspension)가 hiddenByAdmin 없는 글을 다시 보이게 한다
			const post = await getDocFromFirestore({ collection: collectionName, id: postId });
			const creator = post
				? await getDocFromFirestore({ collection: 'Users', id: post.creatorId })
				: null;
			const suspendUntil: Timestamp | null | undefined = creator?.report?.suspendUntil;
			const isCreatorSuspended = !!suspendUntil && Timestamp.now() < suspendUntil;

			await updateDoc(
				postRef,
				isCreatorSuspended
					? { hiddenByAdmin: deleteField() }
					: { status: 'active', hiddenByAdmin: deleteField() },
			);
		},
		{ throwOnError: true },
	);
};

// 숨긴 댓글과 그 답글은 일반 유저 목록에서 빠지므로, 게시글 댓글 수도 댓글 1 + 답글 수만큼 함께 조정한다
export const setCommentHidden = async ({
	collectionName,
	postId,
	commentId,
	hidden,
}: {
	collectionName: Collection;
	postId: string;
	commentId: string;
	hidden: boolean;
}): Promise<void> => {
	await firestoreRequest(
		hidden ? '댓글 숨김' : '댓글 숨김 해제',
		async () => {
			const commentRef = doc(db, collectionName, postId, 'Comments', commentId);
			const repliesSnapshot = await getDocs(collection(commentRef, 'Replies'));
			const affectedCount = 1 + repliesSnapshot.size;

			const batch = writeBatch(db);
			batch.update(commentRef, { hiddenByAdmin: hidden ? true : deleteField() });
			batch.update(doc(db, collectionName, postId), {
				commentCount: increment(hidden ? -affectedCount : affectedCount),
			});
			await batch.commit();
		},
		{ throwOnError: true },
	);
};

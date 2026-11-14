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
import { Reply } from '@/types/reply';
import { Report } from '@/types/report';
import { ReviewWithId } from '@/types/review';
import { AppealResult, IssueSanctionRequest, Sanction, SanctionKind } from '@/types/sanction';
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

export type NeedsReviewUser = {
	user: UserInfo;
	pendingAppealSanctionId: string | null; // 처리 대기 중인 이의 신청이 있으면 그 조치 ID
	unresolvedReportCount: number;
};

// 검토 필요 유저: 처리 대기 중인 이의 신청이 있는 유저 + 처리되지 않은 신고를 받은 유저.
// 대상이 많지 않아 페이지 없이 모두 읽고, 이의 신청 대기 → 미처리 신고 많은 순으로 정렬한다
export const fetchNeedsReviewUsers = async (): Promise<NeedsReviewUser[]> => {
	return firestoreRequest(
		'검토 필요 유저 조회',
		async () => {
			const [pendingAppealsSnap, unresolvedReportsSnap] = await Promise.all([
				getDocs(
					query(collection(db, 'Sanctions'), where('appeal.status', '==', 'pending')),
				),
				getDocs(query(collection(db, 'Reports'), where('resolved', '==', false))),
			]);

			const pendingAppealByUser = new Map<string, string>();
			pendingAppealsSnap.docs.forEach((sanctionDoc) => {
				pendingAppealByUser.set(sanctionDoc.data().userId, sanctionDoc.id);
			});
			const unresolvedCountByUser = new Map<string, number>();
			unresolvedReportsSnap.docs.forEach((reportDoc) => {
				const reporteeId: string = reportDoc.data().reporteeId;
				unresolvedCountByUser.set(
					reporteeId,
					(unresolvedCountByUser.get(reporteeId) ?? 0) + 1,
				);
			});

			const userIds = [
				...new Set([...pendingAppealByUser.keys(), ...unresolvedCountByUser.keys()]),
			];
			const users = await Promise.all(
				userIds.map((uid) => getDocFromFirestore({ collection: 'Users', id: uid })),
			);

			const reviewUsers = users
				.filter((user): user is UserInfo & { id: string } => !!user)
				.map((user) => ({
					user: toUserInfo(user),
					pendingAppealSanctionId: pendingAppealByUser.get(user.id) ?? null,
					unresolvedReportCount: unresolvedCountByUser.get(user.id) ?? 0,
				}));

			return reviewUsers.sort(
				(a, b) =>
					Number(!!b.pendingAppealSanctionId) - Number(!!a.pendingAppealSanctionId) ||
					b.unresolvedReportCount - a.unresolvedReportCount,
			);
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
	reply: Reply | null; // 답글 신고일 때만
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
			const emptyTarget = { collectionName: null, post: null, comment: null, reply: null };

			// 채팅·프로필 신고
			if (!postId) return emptyTarget;

			const collectionName = report.collectionName ?? (await findPostCollection(postId));
			if (!collectionName) return emptyTarget;

			const postDoc = await getDocFromFirestore({ collection: collectionName, id: postId });
			const post = postDoc ? toPost(collectionName, postDoc as PostDoc<Collection>) : null;

			// 게시글 신고
			if (!commentId) return { collectionName, post, comment: null, reply: null };

			// 답글 신고
			if (replyId) {
				const replyDoc = await getDocFromFirestore({
					collection: `${collectionName}/${postId}/Comments/${commentId}/Replies`,
					id: replyId,
				});
				return {
					collectionName,
					post,
					comment: null,
					reply: replyDoc ? (replyDoc as Reply) : null,
				};
			}

			// 댓글 신고
			const commentDoc = await getDocFromFirestore({
				collection: `${collectionName}/${postId}/Comments`,
				id: commentId,
			});
			const comment = commentDoc ? (commentDoc as Comment) : null;

			return { collectionName, post, comment, reply: null };
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

export const issueSanction = async (request: IssueSanctionRequest): Promise<void> => {
	await httpsCallable<IssueSanctionRequest, { sanctionId: string }>(
		functions,
		'issueSanction',
	)(request);
};

export type SanctionRecommendation = {
	recentActiveCount: number; // 이번 조치를 뺀 최근 90일 유효 조치 수
	recommendedKind: SanctionKind;
};

export const fetchSanctionRecommendation = async (uid: string): Promise<SanctionRecommendation> => {
	const result = await httpsCallable<{ uid: string }, SanctionRecommendation>(
		functions,
		'getSanctionRecommendation',
	)({ uid });
	return result.data;
};

// 유저 한 명의 조치 수는 많지 않아 페이지 없이 모두 읽는다
export const fetchUserSanctions = async (uid: string): Promise<Sanction[]> => {
	return firestoreRequest(
		'유저 제재 이력 조회',
		async () => {
			const snapshot = await getDocs(
				query(
					collection(db, 'Sanctions'),
					where('userId', '==', uid),
					orderBy('createdAt', 'desc'),
				),
			);
			return snapshot.docs.map(
				(sanctionDoc) => ({ id: sanctionDoc.id, ...sanctionDoc.data() }) as Sanction,
			);
		},
		{ throwOnError: true },
	);
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
			// 관리자가 따로 숨긴 답글은 이미 댓글 수에서 빠져 있으므로 세지 않는다
			const repliesSnapshot = await getDocs(collection(commentRef, 'Replies'));
			const visibleReplyCount = repliesSnapshot.docs.filter(
				(replyDoc) => !replyDoc.data().hiddenByAdmin,
			).length;
			const affectedCount = 1 + visibleReplyCount;

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

export const fetchSanction = async (sanctionId: string): Promise<Sanction | null> => {
	return firestoreRequest(
		'조치 조회',
		async () => {
			const docData = await getDocFromFirestore({ collection: 'Sanctions', id: sanctionId });
			return docData ? (docData as Sanction) : null;
		},
		{ throwOnError: true },
	);
};

// 조치의 근거 신고. 삭제된 신고는 빠진다
export const fetchReportsByIds = async (reportIds: string[]): Promise<Report[]> => {
	return firestoreRequest(
		'근거 신고 조회',
		async () => {
			const reports = await Promise.all(
				reportIds.map((id) => getDocFromFirestore({ collection: 'Reports', id })),
			);
			return reports.filter((report): report is Report => !!report);
		},
		{ throwOnError: true },
	);
};

// 신고 상세의 [숨김 해제]가 되돌릴 경고: 이 신고를 근거로 한 유효한 경고 조치
export const fetchActiveWarningForReport = async (reportId: string): Promise<Sanction | null> => {
	return firestoreRequest(
		'신고 경고 조치 조회',
		async () => {
			const snapshot = await getDocs(
				query(collection(db, 'Sanctions'), where('reportIds', 'array-contains', reportId)),
			);
			const sanction = snapshot.docs
				.map((sanctionDoc) => ({ id: sanctionDoc.id, ...sanctionDoc.data() }) as Sanction)
				.find(({ kind, status }) => kind === 'warning' && status === 'active');
			return sanction ?? null;
		},
		{ throwOnError: true },
	);
};

export type DecideAppealRequest = {
	sanctionId: string;
	result: AppealResult;
	reply: string;
};

export const decideAppeal = async (request: DecideAppealRequest): Promise<void> => {
	await httpsCallable<DecideAppealRequest, void>(functions, 'decideAppeal')(request);
};

export const cancelSanction = async (sanctionId: string): Promise<void> => {
	await httpsCallable<{ sanctionId: string }, void>(functions, 'cancelSanction')({ sanctionId });
};

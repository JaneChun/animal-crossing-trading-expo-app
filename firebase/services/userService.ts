import {
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_ISLAND_NAME,
	DEFAULT_USER_PHOTO_URL,
	DEFAULT_USER_REPORT,
	DEFAULT_USER_REVIEW,
} from '@/constants/defaultUserInfo';
import { db } from '@/fbase';
import { ReviewValue } from '@/types/review';
import {
	OauthType,
	PublicUserInfo,
	UserInfo,
	UserReport,
	UserReview,
} from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import {
	collection,
	doc,
	query,
	setDoc,
	Timestamp,
	where,
	writeBatch,
} from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import {
	addDocToFirestore,
	deleteDocFromFirestore,
	getDocFromFirestore,
	queryDocs,
	updateDocToFirestore,
} from '../core/firestoreService';
import { getRecent30DaysReportCount } from './reviewService';

export const getUserInfo = async (uid: string): Promise<UserInfo | null> => {
	return firestoreRequest('나의 정보 조회', async () => {
		const docData = await getDocFromFirestore({
			collection: 'Users',
			id: uid,
		});

		if (!docData) {
			return null;
		}

		return {
			uid,
			displayName: docData.displayName,
			photoURL: docData.photoURL,
			islandName: docData.islandName,
			createdAt: docData.createdAt,
			lastLogin: docData.lastLogin,
			oauthType: docData.oauthType,
		};
	});
};

export const saveUserInfo = async ({
	uid,
	displayName,
	islandName,
	photoURL,
	oauthType,
	lastLogin,
}: {
	uid: string;
	displayName: string;
	islandName: string;
	photoURL: string;
	oauthType: OauthType;
	lastLogin?: Timestamp;
}): Promise<void> => {
	return firestoreRequest('나의 정보 저장', async () => {
		await setDoc(
			doc(db, 'Users', uid),
			{
				displayName: displayName ?? '',
				photoURL: photoURL ?? '',
				islandName: islandName ?? '',
				createdAt: Timestamp.now(),
				lastLogin,
				oauthType,
			},
			{ merge: true },
		);
	});
};

export const getPublicUserInfo = async (
	creatorId: string,
): Promise<PublicUserInfo> => {
	try {
		return firestoreRequest('유저 정보 조회', async () => {
			const docData = await getDocFromFirestore({
				collection: 'Users',
				id: creatorId,
			});

			if (!docData) {
				return getDefaultUserInfo(creatorId);
			}

			const userInfo: PublicUserInfo = {
				uid: creatorId,
				displayName: docData.displayName || DEFAULT_USER_DISPLAY_NAME,
				islandName: docData.islandName || DEFAULT_USER_ISLAND_NAME,
				photoURL: docData.photoURL || DEFAULT_USER_PHOTO_URL,
				review: docData.review || DEFAULT_USER_REVIEW,
				report: docData.report || DEFAULT_USER_REPORT,
			};

			return userInfo;
		});
	} catch (e) {
		return getDefaultUserInfo(creatorId);
	}
};

// 문서 ID 기준으로 여러 개의 ID를 한 번에 조회하는 where(..., 'in', [...]) 조건은 최대 10개까지만 지원하므로 청크로 나누어 처리
export const getPublicUserInfos = async (
	creatorIds: string[],
): Promise<Record<string, PublicUserInfo>> => {
	return firestoreRequest('유저 정보 일괄 조회', async () => {
		if (creatorIds.length === 0) return {};

		const usersRef = collection(db, 'Users');

		// 10개로 쪼갬
		const creatorIdsChunks = chunkArray(creatorIds, 10);

		// 병렬 쿼리 처리
		const chunkResults = await Promise.all(
			creatorIdsChunks.map(async (chunk) => {
				const q = query(usersRef, where('__name__', 'in', chunk));
				return await queryDocs(q); // 각 청크에 대한 결과 배열
			}),
		);

		// 결과 병합
		const publicUserInfoMap: Record<string, PublicUserInfo> = {};
		chunkResults.flat().forEach((user) => {
			publicUserInfoMap[user.id] = {
				uid: user.id,
				displayName: user.displayName || DEFAULT_USER_DISPLAY_NAME,
				islandName: user.islandName || DEFAULT_USER_ISLAND_NAME,
				photoURL: user.photoURL || DEFAULT_USER_PHOTO_URL,
				review: user.review || DEFAULT_USER_REVIEW,
				report: user.report || DEFAULT_USER_REPORT,
			};
		});

		// 유저 정보를 ID로 매핑하여 반환
		return publicUserInfoMap;
	});
};

export const chunkArray = <T>(array: T[], size: number): T[][] => {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
};

export const archiveUserData = async (userInfo: UserInfo) => {
	// 1. 탈퇴한 유저 데이터를 DeletedUsers 컬렉션으로 이동
	await moveToDeletedUsers(userInfo);

	// 2. 유저가 생성한 모든 게시글을 isDeleted = true로 변경
	await archiveUserPosts(userInfo.uid);
};

const archiveUserPosts = async (uid: string) => {
	const collections = ['Boards', 'Communities'];
	const batch = writeBatch(db);

	for (const col of collections) {
		const colRef = collection(db, col);
		const q = query(colRef, where('creatorId', '==', uid));
		const docs = await queryDocs(q);

		docs.forEach(({ id }) => {
			const docRef = doc(db, col, id);
			batch.update(docRef, { isDeleted: true });
		});
	}

	await batch.commit();
};

export const restoreUserPosts = async (uid: string) => {
	const collections = ['Boards', 'Communities'];
	const batch = writeBatch(db);

	for (const col of collections) {
		const colRef = collection(db, col);
		const q = query(
			colRef,
			where('creatorId', '==', uid),
			where('isDeleted', '==', true),
		);
		const docs = await queryDocs(q);

		docs.forEach(({ id }) => {
			const docRef = doc(db, col, id);
			batch.update(docRef, { isDeleted: false });
		});
	}

	await batch.commit();
};

export const moveToDeletedUsers = async (userInfo: UserInfo) => {
	// DeletedUsers 컬렉션에 추가
	await addDocToFirestore({
		directory: 'DeletedUsers',
		requestData: {
			...userInfo,
			deletedAt: Timestamp.now(),
		},
	});

	// Users 컬렉션에서 유저 삭제
	await deleteDocFromFirestore({ id: userInfo.uid, collection: 'Users' });
};

export const savePushTokenToFirestore = async ({
	uid,
	pushToken,
}: {
	uid: string;
	pushToken: string;
}) => {
	return firestoreRequest('유저 푸시 토큰 저장', async () => {
		await updateDocToFirestore({
			id: uid,
			collection: 'Users',
			requestData: {
				pushToken,
			},
		});
	});
};

export const setActiveChatRoom = async ({
	userId,
	chatId,
}: {
	userId: string;
	chatId: string;
}) => {
	await updateDocToFirestore({
		id: userId,
		collection: 'Users',
		requestData: {
			activeChatRoomId: chatId,
		},
	});
};

export const updateUserReview = async ({
	userId,
	value,
}: {
	userId: string;
	value: ReviewValue;
}) => {
	const userInfo = await getPublicUserInfo(userId);

	const {
		review = { total: 0, positive: 0, negative: 0, badgeGranted: false },
	} = userInfo;

	const total = review.total + 1;
	const positive = review.positive + (value === 1 ? 1 : 0);
	const negative = review.negative + (value === -1 ? 1 : 0);
	const badgeGranted = total >= 10 && positive / total >= 0.8; // 뱃지 부여 조건: total >= 10, 긍정 비율 ≥ 80%

	const updatedReview: UserReview = {
		total,
		positive,
		negative,
		badgeGranted,
	};

	updateDocToFirestore({
		id: userId,
		collection: 'Users',
		requestData: {
			review: updatedReview,
		},
	});
};

export const updateUserReport = async ({ userId }: { userId: string }) => {
	const userInfo = await getPublicUserInfo(userId);
	const { report = { total: 0, suspendUntil: null } } = userInfo;

	const total = report.total + 1;
	const recent30Days = await getRecent30DaysReportCount({ userId });

	let suspendUntil = report.suspendUntil;
	let needsAdminReview = false;
	const now = Date.now();

	// 최근 30일 신고 5회 이상 → 3일 정지
	if (recent30Days >= 5) {
		suspendUntil = Timestamp.fromDate(new Date(now + 3 * 24 * 60 * 60 * 1000));
	}

	// 누적 신고 10회 이상 → 장기 정지 + 관리자 플래그
	if (total >= 10) {
		suspendUntil = Timestamp.fromDate(
			new Date(now + 365 * 24 * 60 * 60 * 1000),
		);
		needsAdminReview = true;
	}

	const updatedReport: UserReport = {
		total,
		recent30Days,
		suspendUntil,
		...(needsAdminReview ? { needsAdminReview } : {}),
	};

	await updateDocToFirestore({
		id: userId,
		collection: 'Users',
		requestData: {
			report: updatedReport,
		},
	});
};

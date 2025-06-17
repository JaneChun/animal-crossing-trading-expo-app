import {
	DEFAULT_USER_BADGE_GRANTED,
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_ISLAND_NAME,
	DEFAULT_USER_PHOTO_URL,
	DEFAULT_USER_REVIEW,
} from '@/constants/defaultUserInfo';
import { db } from '@/fbase';
import { ReviewValue } from '@/types/review';
import { OauthType, PublicUserInfo, UserInfo } from '@/types/user';
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
				badgeGranted: docData.badgeGranted || DEFAULT_USER_BADGE_GRANTED,
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
				badgeGranted: user.badgeGranted || DEFAULT_USER_BADGE_GRANTED,
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
	return firestoreRequest('리뷰 저장', async () => {
		const userInfo = await getPublicUserInfo(userId);

		const prevReview = userInfo.review || {
			total: 0,
			positive: 0,
			negative: 0,
		};

		const newReview = {
			total: prevReview.total + 1,
			positive: prevReview.positive + (value === 1 ? 1 : 0),
			negative: prevReview.negative + (value === -1 ? 1 : 0),
		};

		// 뱃지 부여 조건: total >= 10, 긍정 비율 ≥ 80%
		const badgeGranted =
			newReview.total >= 10 && newReview.positive / newReview.total >= 0.8;

		updateDocToFirestore({
			id: userId,
			collection: 'Users',
			requestData: {
				review: newReview,
				badgeGranted,
			},
		});
	});
};

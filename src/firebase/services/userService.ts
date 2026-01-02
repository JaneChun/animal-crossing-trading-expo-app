import {
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_ISLAND_NAME,
	DEFAULT_USER_PHOTO_URL,
	DEFAULT_USER_REPORT,
	DEFAULT_USER_REVIEW,
} from '@/constants/defaultUserInfo';
import { db } from '@/config/firebase';
import { PublicUserInfo, UserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { collection, doc, query, setDoc, where } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import {
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

		const { id, ...userData } = docData;

		return { uid: docData.id, ...userData };
	});
};

export const saveUserInfo = async (
	userInfo: Partial<UserInfo> & { uid: string },
): Promise<void> => {
	const { uid, ...data } = userInfo;

	return firestoreRequest('나의 정보 저장', async () => {
		await setDoc(doc(db, 'Users', uid), data, { merge: true });
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

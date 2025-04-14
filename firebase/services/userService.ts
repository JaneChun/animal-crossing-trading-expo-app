import {
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_ISLAND_NAME,
	DEFAULT_USER_PHOTO_URL,
} from '@/constants/defaultUserInfo';
import { db } from '@/fbase';
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
	photoURL,
	oauthType,
	lastLogin,
}: {
	uid: string;
	displayName: string;
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
				islandName: '',
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

			return {
				uid: creatorId,
				displayName: docData.displayName || DEFAULT_USER_DISPLAY_NAME,
				islandName: docData.islandName || DEFAULT_USER_ISLAND_NAME,
				photoURL: docData.photoURL || DEFAULT_USER_PHOTO_URL,
			};
		});
	} catch (e) {
		return getDefaultUserInfo(creatorId);
	}
};

export const getPublicUserInfos = async (
	creatorIds: string[],
): Promise<Record<string, PublicUserInfo>> => {
	return firestoreRequest('유저 정보 일괄 조회', async () => {
		if (creatorIds.length === 0) return {};

		const usersRef = collection(db, 'Users');
		const q = query(usersRef, where('__name__', 'in', creatorIds));

		const usersData = await queryDocs(q);

		// 유저 정보를 ID로 매핑하여 반환
		const publicUserInfoMap: Record<string, PublicUserInfo> = {};
		usersData.forEach((user) => {
			publicUserInfoMap[user.id] = {
				uid: user.id,
				displayName: user.displayName || DEFAULT_USER_DISPLAY_NAME,
				islandName: user.islandName || DEFAULT_USER_ISLAND_NAME,
				photoURL: user.photoURL || DEFAULT_USER_PHOTO_URL,
			};
		});

		return publicUserInfoMap;
	});
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

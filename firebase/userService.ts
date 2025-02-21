import { db } from '@/fbase';
import { collection, doc, query, setDoc, where } from 'firebase/firestore';
import firestoreRequest from './firebaseInterceptor';
import { getDocFromFirestore, queryDocs } from './firestoreService';

export interface PublicUserInfo {
	uid: string;
	displayName: string;
	islandName: string;
	photoURL: string;
}

export interface UserInfo extends PublicUserInfo {
	createdAt: Date;
	lastLogin: Date;
}

const getDefaultPublicUserInfo = (uid: string): PublicUserInfo => ({
	uid,
	displayName: 'Unknown User',
	islandName: '',
	photoURL: '',
});

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
			uid: docData.uid,
			displayName: docData.displayName,
			photoURL: docData.photoURL,
			islandName: docData.islandName,
			createdAt: docData.createdAt,
			lastLogin: docData.lastLogin,
		};
	});
};

export const saveUserInfo = async ({
	uid,
	displayName,
	photoURL,
}: {
	uid: string;
	displayName: string;
	photoURL: string;
}): Promise<void> => {
	return firestoreRequest('나의 정보 저장', async () => {
		await setDoc(
			doc(db, 'Users', uid),
			{
				displayName: displayName ?? '',
				photoURL: photoURL ?? '',
				islandName: '',
				createdAt: new Date(),
				lastLogin: new Date(),
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
				return getDefaultPublicUserInfo(creatorId);
			}

			return {
				uid: creatorId,
				displayName: docData.displayName || 'Unknown User',
				islandName: docData.islandName || '',
				photoURL: docData.photoURL || '',
			};
		});
	} catch (e) {
		return getDefaultPublicUserInfo(creatorId);
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
				displayName: user.displayName || 'Unknown User',
				islandName: user.islandName || '',
				photoURL: user.photoURL || '',
			};
		});

		return publicUserInfoMap;
	});
};

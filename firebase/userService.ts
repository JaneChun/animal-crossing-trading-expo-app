import { db } from '@/fbase';
import { UserInfo } from 'firebase/auth';
import {
	collection,
	doc,
	getDoc,
	query,
	setDoc,
	where,
} from 'firebase/firestore';
import firestoreRequest from './firebaseInterceptor';
import { getDocFromFirestore, queryDocs } from './firestoreService';

export type PublicUserInfo = {
	uid: string;
	displayName: string;
	islandName: string;
	photoURL: string;
};

export const getUserInfoFromFirestore = async ({
	uid,
}: {
	uid: string;
}): Promise<UserInfo> => {
	return firestoreRequest('내 유저 정보 조회', async () => {
		const userRef = doc(db, 'Users', uid);
		const userSnap = await getDoc(userRef);

		if (userSnap.exists()) {
			const fullUserInfo = userSnap.data(); // Firestore에 저장된 유저 데이터 반환
			const { displayName, photoURL, islandName, createdAt, lastLogin } =
				fullUserInfo;

			return { uid, displayName, photoURL, islandName, createdAt, lastLogin };
		} else {
			return null; // Firestore에 데이터 없음
		}
	});
};

export const saveUserToFirestore = async ({
	uid,
	displayName,
	photoURL,
}: {
	uid: string;
	displayName: string;
	photoURL: string;
}): Promise<void> => {
	return firestoreRequest('유저 정보 저장', async () => {
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

const getDefaultPublicUserInfo = (uid: string): PublicUserInfo => ({
	uid,
	displayName: 'Unknown User',
	islandName: '',
	photoURL: '',
});

export const getPublicUserInfos = async (
	creatorIds: string[],
): Promise<Record<string, PublicUserInfo>> => {
	return firestoreRequest('유저 정보 일괄 조회', async () => {
		if (creatorIds.length === 0) return {};

		const usersRef = collection(db, 'Users');
		const q = query(usersRef, where('__name__', 'in', creatorIds));

		const usersData = await queryDocs(q);

		// 유저 정보를 ID 기반 객체로 변환
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

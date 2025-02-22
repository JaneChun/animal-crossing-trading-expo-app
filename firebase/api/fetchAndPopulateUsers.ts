import { getPublicUserInfos } from '@/firebase/services/userService';
import { PublicUserInfo } from '@/types/user';
import {
	DocumentData,
	getDocs,
	Query,
	QueryDocumentSnapshot,
} from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';

export const fetchAndPopulateUsers = async <T extends { creatorId: string }, U>(
	q: Query,
): Promise<{
	data: U[];
	lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> => {
	return firestoreRequest('컬렉션 데이터 조회', async () => {
		// 1. 데이터 조회
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return { data: [], lastDoc: null };

		const data: T[] = querySnapshot.docs.map((doc) => {
			const docData = doc.data();
			return {
				id: doc.id,
				...docData,
			} as unknown as T;
		});

		// 2. 데이터에서 creatorId 추출
		const uniqueCreatorIds: string[] = [
			...new Set(data.map((item) => item.creatorId)),
		];

		// 3. 유저 정보 한 번에 조회
		const publicUserInfos: Record<string, PublicUserInfo> =
			await getPublicUserInfos(uniqueCreatorIds);

		// 4. 유저 정보와 데이터 병합
		const populatedData: U[] = data.map((item) => {
			const { displayName, islandName, photoURL } =
				publicUserInfos[item.creatorId];

			return {
				...item,
				creatorDisplayName: displayName,
				creatorIslandName: islandName,
				creatorPhotoURL: photoURL,
			} as U;
		});

		return {
			data: populatedData,
			lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
		};
	});
};

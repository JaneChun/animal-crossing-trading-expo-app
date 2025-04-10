import { getPublicUserInfos } from '@/firebase/services/userService';
import { PublicUserInfo } from '@/types/user';
import { DocumentData, getDocs, Query } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';

export const fetchAndPopulateUsers = async <
	T extends { creatorId: string },
	U extends T & {
		creatorDisplayName: string;
		creatorIslandName: string;
		creatorPhotoURL: string;
	},
>(
	q: Query<DocumentData>,
	transform: (doc: DocumentData, id: string) => T,
) => {
	return firestoreRequest('컬렉션 데이터 조회', async () => {
		// 1. 데이터 조회
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return { data: [], lastDoc: null };

		// 2. 데이터 변환
		const data: T[] = [];

		querySnapshot.docs.forEach((doc) => {
			const docData = doc.data();
			const id = doc.id;

			if (docData) {
				const transformed = transform(docData, id) as T;
				data.push(transformed);
			}
		});

		// 3. 데이터에서 creatorId 추출
		const uniqueCreatorIds: string[] = [
			...new Set(data.map((item) => item.creatorId)),
		];

		// 4. 유저 정보 한 번에 조회
		const publicUserInfos: Record<string, PublicUserInfo> =
			await getPublicUserInfos(uniqueCreatorIds);

		// 5. 유저 정보와 데이터 병합
		const populatedData: U[] = data.map((item) => {
			const userInfo = publicUserInfos[item.creatorId] || {
				displayName: '탈퇴한 사용자',
				islandName: '무인도',
				photoURL: '',
			};

			return {
				...item,
				creatorDisplayName: userInfo.displayName,
				creatorIslandName: userInfo.islandName,
				creatorPhotoURL: userInfo.photoURL,
			} as U;
		});

		return {
			data: populatedData,
			lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
		};
	});
};

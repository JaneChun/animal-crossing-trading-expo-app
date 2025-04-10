import { getPublicUserInfos } from '@/firebase/services/userService';
import { Post, PostWithCreatorInfo } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { DocumentData, getDocs, Query } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';

export const fetchAndPopulateUsers = async (q: Query<DocumentData>) => {
	return firestoreRequest('컬렉션 데이터 조회', async () => {
		// 1. 데이터 조회
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return { data: [], lastDoc: null };

		const data: Post[] = querySnapshot.docs.map((doc) => {
			const docData = doc.data();
			return {
				id: doc.id,
				...docData,
			} as Post;
		});

		// 2. 데이터에서 creatorId 추출
		const uniqueCreatorIds: string[] = [
			...new Set(data.map((item) => item.creatorId)),
		];

		// 3. 유저 정보 한 번에 조회
		const publicUserInfos: Record<string, PublicUserInfo> =
			await getPublicUserInfos(uniqueCreatorIds);

		// 4. 유저 정보와 데이터 병합
		const populatedData: PostWithCreatorInfo[] = data.map((item) => {
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
			};
		});

		return {
			data: populatedData,
			lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
		};
	});
};

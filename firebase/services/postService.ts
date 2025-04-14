import { Collection } from '@/types/components';
import {
	CreatePostRequest,
	Post,
	PostDoc,
	UpdatePostRequest,
} from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { toPost } from '@/utilities/toPost';
import { DocumentData, getDocs, Query, Timestamp } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import {
	addDocToFirestore,
	deleteDocFromFirestore,
	getDocFromFirestore,
	updateDocToFirestore,
} from '../core/firestoreService';
import { getPublicUserInfos } from './userService';

export const fetchAndPopulateUsers = async <T extends { creatorId: string }, U>(
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
			const userInfo =
				publicUserInfos[item.creatorId] || getDefaultUserInfo(item.creatorId);

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

export const getPost = async (
	collectionName: Collection,
	postId: string,
): Promise<Post | null> => {
	return firestoreRequest('게시글 조회', async () => {
		const docData = (await getDocFromFirestore({
			collection: collectionName,
			id: postId,
		})) as PostDoc;

		return docData ? toPost(docData) : null;
	});
};

export const createPost = async (
	collectionName: Collection,
	requestData: CreatePostRequest,
): Promise<string> => {
	return firestoreRequest('게시글 생성', async () => {
		const createdId = await addDocToFirestore({
			directory: collectionName,
			requestData: {
				...requestData,
				createdAt: Timestamp.now(),
				isDeleted: false,
				commentCount: 0,
			},
		});

		return createdId;
	});
};

export const updatePost = async (
	collectionName: Collection,
	id: string,
	requestData: UpdatePostRequest,
): Promise<void> => {
	return firestoreRequest('게시글 수정', async () => {
		await updateDocToFirestore({
			collection: collectionName,
			id,
			requestData: { ...requestData, updatedAt: Timestamp.now() },
		});
	});
};

export const deletePost = async (
	collectionName: Collection,
	postId: string,
) => {
	return firestoreRequest('게시글 삭제', async () => {
		await deleteDocFromFirestore({ id: postId, collection: collectionName });
	});
};

import { db } from '@/config/firebase';
import { Collection, CreatePostRequest, Post, PostDoc, UpdatePostRequest } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { sanitize } from '@/utilities/sanitize';
import { toPost } from '@/utilities/toPost';
import {
	collection,
	DocumentData,
	getDocs,
	query,
	Query,
	Timestamp,
	where,
} from 'firebase/firestore';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';
import {
	addDocToFirestore,
	deleteDocFromFirestore,
	getDocFromFirestore,
	queryDocs,
	updateDocToFirestore,
} from '@/firebase/core/firestoreService';
import { chunkArray, getPublicUserInfos } from './userService';

export const fetchAndPopulateUsers = async <C extends Collection, T extends Post<C>, U>(
	q: Query<DocumentData>,
) => {
	return firestoreRequest('컬렉션 데이터 조회', async () => {
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return { data: [], lastDoc: null };

		const data: T[] = querySnapshot.docs.map((doc) => {
			const docData = doc.data();
			const id = doc.id;

			return { id, ...docData } as T;
		});

		const uniqueCreatorIds: string[] = [...new Set(data.map((item) => item.creatorId))];

		const publicUserInfos: Record<string, PublicUserInfo> =
			await getPublicUserInfos(uniqueCreatorIds);

		const populatedData: U[] = data.map((item) => {
			const userInfo = publicUserInfos[item.creatorId] || getDefaultUserInfo(item.creatorId);

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

export const getPost = async <C extends Collection>(
	collectionName: C,
	postId: string,
): Promise<Post<C> | null> => {
	return firestoreRequest('게시글 조회', async () => {
		const docData = (await getDocFromFirestore({
			collection: collectionName,
			id: postId,
		})) as PostDoc<C>;

		if (!docData) return null;

		return toPost(collectionName, docData);
	});
};

export const getPosts = async (postIds: string[]): Promise<Record<string, Post<Collection>>> => {
	return firestoreRequest('게시글 목록 조회', async () => {
		if (postIds.length === 0) return {};

		const collections: Collection[] = ['Boards', 'Communities'];
		const postsMap: Record<string, Post<Collection>> = {};

		for (const collectionName of collections) {
			// 10개로 쪼갬
			const postIdChunks = chunkArray(postIds, 10);

			// 병렬 쿼리 처리
			const chunkResults = await Promise.all(
				postIdChunks.map(async (chunk) => {
					const collectionRef = collection(db, collectionName);
					const q = query(collectionRef, where('__name__', 'in', chunk));
					const postsData = await queryDocs(q);

					return postsData.map((doc) => doc as PostDoc<Collection>);
				}),
			);

			// 결과 병합
			chunkResults.flat().forEach((postDoc) => {
				const post = toPost(collectionName, postDoc);
				postsMap[postDoc.id] = post;
			});
		}

		// 게시물 정보를 ID로 매핑하여 반환
		return postsMap;
	});
};

export const createPost = async <C extends Collection>({
	collectionName,
	requestData,
	userId,
}: {
	collectionName: C;
	requestData: CreatePostRequest<C>;
	userId: string;
}): Promise<string> => {
	return firestoreRequest(
		'게시글 생성',
		async () => {
			const cleanData: CreatePostRequest<C> = { ...requestData };
			cleanData.title = sanitize(cleanData.title);
			cleanData.body = sanitize(cleanData.body);

			const createdId = await addDocToFirestore({
				directory: collectionName,
				requestData: {
					...cleanData,
					creatorId: userId,
					createdAt: Timestamp.now(),
					commentCount: 0,
					chatRoomIds: [],
					reviewPromptSent: false,
					status: 'active',
				},
			});

			return createdId;
		},
		{ throwOnError: true },
	);
};

export const updatePost = async <C extends Collection>({
	collectionName,
	postId,
	requestData,
}: {
	collectionName: C;
	postId: string;
	requestData: UpdatePostRequest<C>;
}): Promise<void> => {
	return firestoreRequest(
		'게시글 수정',
		async () => {
			const cleanData: Partial<UpdatePostRequest<C>> = { ...requestData };
			if (cleanData?.title) cleanData.title = sanitize(cleanData.title);
			if (cleanData?.body) cleanData.body = sanitize(cleanData.body);

			await updateDocToFirestore({
				collection: collectionName,
				id: postId,
				requestData: {
					...cleanData,
					updatedAt: Timestamp.now(),
				},
			});
		},
		{ throwOnError: true },
	);
};

export const deletePost = async <C extends Collection>(
	collectionName: C,
	postId: string,
): Promise<void> => {
	return firestoreRequest(
		'게시글 삭제',
		async () => {
			await deleteDocFromFirestore({ id: postId, collection: collectionName });
		},
		{ throwOnError: true },
	);
};

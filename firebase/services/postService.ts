import { db } from '@/fbase';
import {
	Collection,
	CreatePostRequest,
	Post,
	PostDoc,
	UpdatePostRequest,
} from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
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
import firestoreRequest from '../core/firebaseInterceptor';
import {
	addDocToFirestore,
	deleteDocFromFirestore,
	getDocFromFirestore,
	queryDocs,
	updateDocToFirestore,
} from '../core/firestoreService';
import { chunkArray, getPublicUserInfos } from './userService';

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

export const getPost = async <C extends Collection>(
	collectionName: C,
	postId: string,
): Promise<Post<C> | null> => {
	return firestoreRequest('게시글 조회', async () => {
		const docData = (await getDocFromFirestore({
			collection: collectionName,
			id: postId,
		})) as PostDoc<C>;

		if (!docData || docData.isDeleted) return null;

		return toPost(collectionName, docData);
	});
};

export const getPosts = async (
	postIds: string[],
): Promise<Record<string, Post<Collection>>> => {
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
				if (!postDoc.isDeleted) {
					const post = toPost(collectionName, postDoc);
					postsMap[postDoc.id] = post;
				}
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
	return firestoreRequest('게시글 생성', async () => {
		const createdId = await addDocToFirestore({
			directory: collectionName,
			requestData: {
				...requestData,
				creatorId: userId,
				createdAt: Timestamp.now(),
				isDeleted: false,
				commentCount: 0,
				chatRoomIds: [],
				reviewPromptSent: false,
			},
		});

		return createdId;
	});
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
	return firestoreRequest('게시글 수정', async () => {
		const existingPost = await getPost(collectionName, postId);
		if (!existingPost) throw new Error('게시글을 찾을 수 없습니다.');

		await updateDocToFirestore({
			collection: collectionName,
			id: postId,
			requestData: {
				...requestData,
				updatedAt: Timestamp.now(),
			},
		});
	});
};

export const deletePost = async <C extends Collection>(
	collectionName: C,
	postId: string,
): Promise<void> => {
	return firestoreRequest('게시글 삭제', async () => {
		await deleteDocFromFirestore({ id: postId, collection: collectionName });
	});
};

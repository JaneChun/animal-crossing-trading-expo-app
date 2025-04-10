import { Collection } from '@/types/components';
import {
	CreatePostRequest,
	Post,
	PostDoc,
	UpdatePostRequest,
} from '@/types/post';
import { toPost } from '@/utilities/toPost';
import { Timestamp } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import {
	addDocToFirestore,
	deleteDocFromFirestore,
	getDocFromFirestore,
	updateDocToFirestore,
} from '../core/firestoreService';

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

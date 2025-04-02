import { Collection } from '@/types/components';
import { CreatePostRequest, Post, UpdatePostRequest } from '@/types/post';
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
		const docData = await getDocFromFirestore({
			collection: collectionName,
			id: postId,
		});

		if (!docData) {
			return null;
		}

		const post: Post = {
			id: docData.id,
			type: docData.type,
			title: docData.title,
			body: docData.body,
			images: docData.images,
			creatorId: docData.creatorId,
			createdAt: docData.createdAt,
			cart: docData.cart,
			commentCount: docData.commentCount,
		};

		return post;
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
				isDeleted: false,
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
			requestData,
		});
	});
};

export const deletePost = async ({
	collectionName,
	postId,
}: {
	collectionName: Collection;
	postId: string;
}) => {
	return firestoreRequest('게시글 삭제', async () => {
		await deleteDocFromFirestore({ id: postId, collection: collectionName });
	});
};

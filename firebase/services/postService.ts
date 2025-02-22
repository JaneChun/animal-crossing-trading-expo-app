import { CreatePostRequest, Post, UpdatePostRequest } from '@/types/post';
import firestoreRequest from '../core/firebaseInterceptor';
import {
	addDocToFirestore,
	deleteDocFromFirestore,
	getDocFromFirestore,
	updateDocToFirestore,
} from '../core/firestoreService';

export const getPost = async (postId: string): Promise<Post | null> => {
	return firestoreRequest('게시글 조회', async () => {
		const docData = await getDocFromFirestore({
			collection: 'Boards',
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
	requestData: CreatePostRequest,
): Promise<string> => {
	return firestoreRequest('게시글 생성', async () => {
		const createdId = await addDocToFirestore({
			directory: 'Boards',
			requestData,
		});

		return createdId;
	});
};

export const updatePost = async (
	id: string,
	requestData: UpdatePostRequest,
): Promise<void> => {
	return firestoreRequest('게시글 수정', async () => {
		await updateDocToFirestore({
			collection: 'Boards',
			id,
			requestData,
		});
	});
};

export const deletePost = async (postId: string) => {
	return firestoreRequest('게시글 삭제', async () => {
		await deleteDocFromFirestore({ id: postId });
	});
};

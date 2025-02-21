import { CartItem } from '@/screens/NewPost';
import { Timestamp } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import {
	addDocToFirestore,
	deleteDocFromFirestore,
	getDocFromFirestore,
	updateDocToFirestore,
} from '../core/firestoreService';

export interface postDoc {
	id: string;
	type: 'buy' | 'sell' | 'done';
	title: string;
	body: string;
	images: string[];
	creatorId: string;
	createdAt: Timestamp;
	cart: CartItem[];
	commentCount: number;
}

export const getPost = async (postId: string): Promise<postDoc | null> => {
	return firestoreRequest('게시글 조회', async () => {
		const docData = await getDocFromFirestore({
			collection: 'Boards',
			id: postId,
		});

		if (!docData) {
			return null;
		}

		const post: postDoc = {
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

export const createPost = async (requestData: any): Promise<string> => {
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
	requestData: any,
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

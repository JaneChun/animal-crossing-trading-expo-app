import { CartItem } from '@/screens/NewPost';
import { Timestamp } from 'firebase/firestore';
import {
	addDocToFirestore,
	deleteDocFromFirestore,
	getDocFromFirestore,
	updateDocToFirestore,
} from './firestoreService';

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
};

export const createPost = async (requestData: any): Promise<string> => {
	const createdId = await addDocToFirestore({
		directory: 'Boards',
		requestData,
	});

	return createdId;
};

export const updatePost = async (
	id: string,
	requestData: any,
): Promise<void> => {
	await updateDocToFirestore({
		collection: 'Boards',
		id,
		requestData,
	});
};

export const deletePost = async (postId: string) => {
	await deleteDocFromFirestore({ id: postId });
};

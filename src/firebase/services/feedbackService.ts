import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db } from '@/config/firebase';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';

const COLLECTION = 'Feedbacks';

export const submitFeedback = async ({ uid, body }: { uid: string; body: string }): Promise<void> => {
	await firestoreRequest(
		'의견 보내기',
		() => addDoc(collection(db, COLLECTION), { uid, body, createdAt: serverTimestamp() }),
		{ throwOnError: true },
	);
};

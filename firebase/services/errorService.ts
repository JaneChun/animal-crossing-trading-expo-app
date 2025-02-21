import { db } from '@/fbase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';

export const reportError = async (
	errorMessage: string,
	errorStack: string,
): Promise<void> => {
	return firestoreRequest('에러 리포트', async () => {
		await addDoc(collection(db, 'Errors'), {
			message: errorMessage,
			stack: errorStack,
			timestamp: Timestamp.now(),
			platform: 'React Native Expo',
		});
	});
};

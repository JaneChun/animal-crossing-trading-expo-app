import reactotron from 'reactotron-react-native';
import { FirestoreRequestOptions, ThrowOnErrorOptions, isFirebaseError } from './types';
import { handleError } from './errorMessages';

// throwOnError: true → 에러 시 throw, 성공 시 T 반환 (null 없음)
function firestoreRequest<T>(
	requestName: string,
	operation: () => Promise<T>,
	options: ThrowOnErrorOptions,
): Promise<T>;

// throwOnError: false/없음 → 에러 시 Alert + null 반환
function firestoreRequest<T>(
	requestName: string,
	operation: () => Promise<T>,
	options?: FirestoreRequestOptions,
): Promise<T | null>;

async function firestoreRequest<T>(
	requestName: string,
	operation: () => Promise<T>,
	options?: FirestoreRequestOptions,
): Promise<T | null> {
	try {
		const result = await operation();
		if (__DEV__) {
			reactotron.display({
				name: 'FIRESTORE',
				preview: requestName,
				value: JSON.stringify(result),
			});
		}
		return result;
	} catch (error: unknown) {
		console.warn(`❌ Firestore 요청 : ${requestName} 실패`, error);

		if (options?.throwOnError) {
			throw error;
		}

		// non-Firebase 에러는 빈 객체로 전달하여 UNKNOWN 메시지 표시
		handleError(isFirebaseError(error) ? error : {});

		return null;
	}
}

export default firestoreRequest;

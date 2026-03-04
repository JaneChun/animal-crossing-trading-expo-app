export type FirestoreRequestOptions = {
	// true이면 Alert 없이 에러를 호출자에게 전파 (mutation에서 onError toast 처리용)
	throwOnError?: boolean;
};

// throwOnError: true를 명시적으로 전달할 때 사용 (리턴 타입에서 null 제거)
export type ThrowOnErrorOptions = FirestoreRequestOptions & { throwOnError: true };

export interface FirebaseError {
	code?: string;
	message?: string;
}

// unknown 타입의 에러를 FirebaseError로 좁히기 위한 타입 가드
export const isFirebaseError = (error: unknown): error is FirebaseError => {
	return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
};

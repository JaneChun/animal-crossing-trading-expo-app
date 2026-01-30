/**
 * 공통 Mock 헬퍼
 * 테스트 전반에서 재사용되는 Mock 팩토리 함수들
 */

/**
 * Firebase Functions HttpsError Mock 팩토리
 * instanceof 검사를 지원하는 Mock Error 객체 생성
 */
export function createMockHttpsError() {
	const MockHttpsError = jest
		.fn()
		.mockImplementation((code: string, message: string, details?: unknown) => {
			const error = new Error(message);
			error.name = 'HttpsError';
			(error as any).code = code;
			(error as any).details = details;
			Object.setPrototypeOf(error, MockHttpsError.prototype);
			return error;
		});

	return MockHttpsError;
}

/**
 * Firebase Functions 모듈 Mock 설정
 * @returns mock된 firebase-functions 객체
 */
export function createFirebaseFunctionsMock() {
	const MockHttpsError = createMockHttpsError();

	return {
		https: {
			HttpsError: MockHttpsError,
			onCall: jest.fn(),
		},
	};
}

/**
 * Axios Mock 설정
 * 모든 HTTP 메서드를 Mock
 */
export function createMockAxios() {
	return {
		get: jest.fn(),
		post: jest.fn(),
		put: jest.fn(),
		delete: jest.fn(),
	};
}

/**
 * Firestore Document/Collection Chain Mock 팩토리
 * Firestore의 메서드 체이닝을 시뮬레이션
 */
export function createMockFirestoreChain() {
	const mockGet = jest.fn();
	const mockSet = jest.fn();
	const mockUpdate = jest.fn();
	const mockDelete = jest.fn();

	const mockDoc = jest.fn().mockReturnValue({
		get: mockGet,
		set: mockSet,
		update: mockUpdate,
		delete: mockDelete,
	});

	const mockCollection = jest.fn().mockReturnValue({
		doc: mockDoc,
	});

	return {
		mockGet,
		mockSet,
		mockUpdate,
		mockDelete,
		mockDoc,
		mockCollection,
		db: {
			doc: mockDoc,
			collection: mockCollection,
		},
	};
}

/**
 * Firebase FieldValue Mock 팩토리
 * increment, arrayUnion 등 Firestore atomic 연산 Mock
 */
export function createMockFieldValue() {
	const mockIncrement = jest.fn((value: number) => ({
		_methodName: 'FieldValue.increment',
		operand: value,
	}));

	const mockArrayUnion = jest.fn((...elements: unknown[]) => ({
		_methodName: 'FieldValue.arrayUnion',
		elements,
	}));

	const mockArrayRemove = jest.fn((...elements: unknown[]) => ({
		_methodName: 'FieldValue.arrayRemove',
		elements,
	}));

	const mockServerTimestamp = jest.fn(() => ({
		_methodName: 'FieldValue.serverTimestamp',
	}));

	return {
		mockIncrement,
		mockArrayUnion,
		mockArrayRemove,
		mockServerTimestamp,
		FieldValue: {
			increment: mockIncrement,
			arrayUnion: mockArrayUnion,
			arrayRemove: mockArrayRemove,
			serverTimestamp: mockServerTimestamp,
		},
	};
}

/**
 * Firebase Timestamp Mock 팩토리
 */
export function createMockTimestamp(date?: Date) {
	const mockDate = date || new Date();

	return {
		toDate: jest.fn().mockReturnValue(mockDate),
		toMillis: jest.fn().mockReturnValue(mockDate.getTime()),
		seconds: Math.floor(mockDate.getTime() / 1000),
		nanoseconds: (mockDate.getTime() % 1000) * 1000000,
	};
}

/**
 * Timestamp 클래스 Mock 팩토리
 */
export function createMockTimestampClass() {
	const mockNow = jest.fn().mockReturnValue(createMockTimestamp());
	const mockFromDate = jest.fn((date: Date) => createMockTimestamp(date));

	return {
		mockNow,
		mockFromDate,
		Timestamp: {
			now: mockNow,
			fromDate: mockFromDate,
		},
	};
}

/**
 * 푸시 알림 Mock 팩토리
 */
export function createMockPushNotification() {
	const mockSendPushNotification = jest.fn().mockResolvedValue(undefined);

	return {
		mockSendPushNotification,
		sendPushNotification: mockSendPushNotification,
	};
}

/**
 * truncateText Mock 팩토리
 * 실제 로직을 시뮬레이션
 */
export function createMockTruncateText() {
	return jest.fn((text: string, maxLength: number) =>
		text.length <= maxLength ? text : text.substring(0, maxLength) + '...',
	);
}

/**
 * Firebase Admin SDK Mock 팩토리
 */
export function createMockFirebaseAdmin() {
	const mockCreateCustomToken = jest.fn();
	const mockDeleteUser = jest.fn();
	const mockGetUser = jest.fn();

	return {
		initializeApp: jest.fn(),
		apps: { length: 1 },
		auth: jest.fn(() => ({
			createCustomToken: mockCreateCustomToken,
			deleteUser: mockDeleteUser,
			getUser: mockGetUser,
		})),
		firestore: jest.fn(() => ({
			collection: jest.fn().mockReturnThis(),
			doc: jest.fn().mockReturnThis(),
			get: jest.fn(),
			set: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		})),
		mocks: {
			mockCreateCustomToken,
			mockDeleteUser,
			mockGetUser,
		},
	};
}

/**
 * console.error 및 console.warn을 silence하는 Mock 설정
 */
export function silenceConsole() {
	const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
	const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

	return {
		errorSpy,
		warnSpy,
		restore: () => {
			errorSpy.mockRestore();
			warnSpy.mockRestore();
		},
	};
}

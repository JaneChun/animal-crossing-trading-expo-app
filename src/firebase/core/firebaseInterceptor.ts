import { Alert } from 'react-native';
import reactotron from 'reactotron-react-native';

// 에러 메시지 상수들 - 테스트에서 재사용하기 위해 export
export const ERROR_MESSAGES = {
	SPECIAL: {
		'functions/failed-precondition': {
			title: '가입 제한 안내',
			message:
				'탈퇴한 지 30일이 경과해야 동일한 소셜 계정으로 재가입이 가능합니다.\n궁금하신 사항은 고객센터로 문의해 주세요.',
		},
		'auth/requires-recent-login': {
			title: '인증 오류',
			message: '최근에 로그인한 계정이 아닙니다. 보안을 위해 다시 로그인해주세요.',
		},
		'firestore/permission-denied': {
			title: '인증 오류',
			message: '권한이 없습니다. 로그인 상태를 확인해주세요.',
		},
	},
	CATEGORY: {
		auth: {
			title: '인증 오류',
			message: '인증 처리 중 문제가 발생했습니다. 다시 시도해주세요.',
		},
		network: {
			title: '네트워크 오류',
			message: '네트워크 연결에 문제가 발생했습니다. 인터넷 상태를 확인해주세요.',
		},
		firestore: {
			title: '서버 오류',
			message: '서버 요청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
		},
	},
	UNKNOWN: {
		title: '요청 중 문제가 발생했습니다.',
		getMessage: (errorCode?: string) =>
			`지속적으로 발생할 경우 고객센터로 문의해주세요.\n${
				errorCode ? `(오류 코드: ${errorCode}) ` : ''
			}`,
	},
} as const;

const getErrorCategory = (errorCode: string): string => {
	if (errorCode?.startsWith('auth/')) return 'auth';
	if (errorCode?.startsWith('network/')) return 'network';
	if (errorCode?.startsWith('firestore/')) return 'firestore';
	return 'unknown';
};

const handleError = (error: any): void => {
	const errorCode = error.code || '';

	// 특별한 에러 코드 처리
	if (ERROR_MESSAGES.SPECIAL[errorCode as keyof typeof ERROR_MESSAGES.SPECIAL]) {
		const { title, message } =
			ERROR_MESSAGES.SPECIAL[errorCode as keyof typeof ERROR_MESSAGES.SPECIAL];
		Alert.alert(title, message);
		return;
	}

	// 에러 카테고리별 기본 메시지
	const category = getErrorCategory(errorCode);
	if (ERROR_MESSAGES.CATEGORY[category as keyof typeof ERROR_MESSAGES.CATEGORY]) {
		const { title, message } =
			ERROR_MESSAGES.CATEGORY[category as keyof typeof ERROR_MESSAGES.CATEGORY];
		Alert.alert(title, message);
		return;
	}

	// 알 수 없는 에러
	Alert.alert(ERROR_MESSAGES.UNKNOWN.title, ERROR_MESSAGES.UNKNOWN.getMessage(errorCode));
};

type FirestoreRequestOptions = {
	// true이면 Alert 없이 에러를 호출자에게 전파 (mutation에서 onError toast 처리용)
	throwOnError?: boolean;
};

const firestoreRequest = async (
	requestName: string,
	operation: () => Promise<any>,
	options?: FirestoreRequestOptions,
) => {
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
	} catch (error: any) {
		console.log(`❌ Firestore 요청 : ${requestName} 실패`, error);
		console.log(error.code, error.message);

		if (options?.throwOnError) {
			throw error;
		}

		// 기본 동작: Alert 표시 후 null 반환 (에러 삼킴)
		handleError(error);
		return null;
	}
};

export default firestoreRequest;

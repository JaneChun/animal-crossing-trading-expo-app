import { Alert } from 'react-native';

const firestoreRequest = async (
	requestName: string,
	operation: () => Promise<any>,
) => {
	try {
		// console.log(`📡 Firestore 요청 : ${requestName} 시작...`);
		const result = await operation();
		// console.log(`✅ Firestore 요청 : ${requestName} 성공`);
		return result;
	} catch (error: any) {
		console.log(`❌ Firestore 요청 : ${requestName} 실패`, error);

		console.log(error.code, error.message);

		// 탈퇴 후 재가입 제한 에러 처리
		if (error.code === 'functions/failed-precondition') {
			Alert.alert(
				'가입 제한 안내',
				'탈퇴한 지 30일이 경과해야 동일한 소셜 계정으로 재가입이 가능합니다.\n궁금하신 사항은 고객센터로 문의해 주세요.',
			);
			// 인증 오류 처리
		} else if (error.code?.startsWith('auth/')) {
			const message = handleAuthError(error.code);
			Alert.alert('인증 오류', message);
		}
		// 네트워크 오류 처리
		else if (
			error.code?.startsWith('auth/') ||
			error.code?.startsWith('network/')
		) {
			const message = handleNetworkError(error.code);
			Alert.alert('네트워크 오류', message);
		}
		// Firestore 오류 처리
		else if (error.code?.startsWith('firestore/')) {
			const message = handleFirestoreError(error.code);
			Alert.alert('서버 오류', message);
		}
		// 그 외
		else {
			Alert.alert(
				'요청 중 문제가 발생했습니다.',
				`지속적으로 발생할 경우 고객센터로 문의해주세요.\n${
					error.code ? `(오류 코드: ${error.code}) ` : ''
				}`,
			);
		}

		throw error;
	}
};

export default firestoreRequest;

const handleAuthError = (errorCode: string) => {
	const authErrorMessages: { [key: string]: string } = {
		'auth/requires-recent-login':
			'최근에 로그인한 계정이 아닙니다. 보안을 위해 다시 로그인해주세요.',
		'auth/user-not-found': '이메일 혹은 비밀번호가 일치하지 않습니다.',
		'auth/wrong-password': '이메일 혹은 비밀번호가 일치하지 않습니다.',
		'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
		'auth/weak-password': '비밀번호는 6글자 이상이어야 합니다.',
		'auth/network-request-failed': '네트워크 연결에 실패 하였습니다.',
		'auth/invalid-email': '잘못된 이메일 형식입니다.',
		'auth/internal-error': '잘못된 요청입니다.',
	};

	return authErrorMessages[errorCode] || '로그인에 실패 하였습니다.';
};

const handleNetworkError = (errorCode: string) => {
	const networkErrorMessages: { [key: string]: string } = {
		'auth/network-request-failed':
			'네트워크 연결이 불안정합니다. 인터넷 상태를 확인해주세요.',
		'auth/too-many-requests':
			'요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
		'auth/quota-exceeded':
			'현재 요청이 많아 처리할 수 없습니다. 잠시 후 다시 시도해주세요.',
		'auth/timeout':
			'서버 응답 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.',
	};

	return (
		networkErrorMessages[errorCode] || '네트워크 연결에 문제가 발생했습니다.'
	);
};

const handleFirestoreError = (errorCode: string) => {
	const firestoreErrorMessages: { [key: string]: string } = {
		'firestore/permission-denied':
			'권한이 없습니다. 로그인 상태를 확인해주세요.',
		'firestore/not-found': '요청하신 데이터를 찾을 수 없습니다.',
		'firestore/cancelled': '요청이 취소되었습니다. 다시 시도해주세요.',
		'firestore/unavailable':
			'서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
		'firestore/unknown': '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.',
		'firestore/deadline-exceeded':
			'서버 응답 시간이 초과되었습니다. 다시 시도해주세요.',
	};

	return (
		firestoreErrorMessages[errorCode] ||
		'서버 요청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
	);
};

import { Alert } from 'react-native';

const firestoreRequest = async (
	requestName: string,
	operation: () => Promise<any>,
) => {
	try {
		console.log(`📡 Firestore 요청 시작: ${requestName}...`);
		const result = await operation();
		console.log(`✅ Firestore 요청 성공: ${requestName}`);
		return result;
	} catch (error: any) {
		console.error(`❌ Firestore 요청 실패: ${requestName}`, error);

		// 네트워크 오류 처리
		if (
			error.code === 'unavailable' ||
			error.code === 'network-request-failed'
		) {
			Alert.alert(
				'네트워크 오류',
				`인터넷 연결을 확인해주세요.\n(${requestName})`,
			);
		} else {
			Alert.alert(
				'Firestore 오류',
				`요청 실패: ${requestName}\n${
					error.message || '알 수 없는 오류가 발생했습니다.'
				}`,
			);
		}

		throw error;
	}
};

export default firestoreRequest;

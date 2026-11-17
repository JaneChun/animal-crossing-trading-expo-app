import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/config/firebase';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';

// 테스터 모집이 끝나면 이 파일째 삭제한다
const COLLECTION = 'AndroidTesterEmails';

// email은 스키마에서 정규화(공백 제거·소문자)한 값이다. 문서 ID로 써서 중복 신청을 규칙에서 막는다
export const submitAndroidTesterEmail = async (email: string): Promise<void> => {
	await firestoreRequest(
		'Android 테스터 신청',
		() => setDoc(doc(db, COLLECTION, email), { email, createdAt: serverTimestamp() }),
		{ throwOnError: true },
	);
};

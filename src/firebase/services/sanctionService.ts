import {
	collection,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';
import { Sanction } from '@/types/sanction';

// 내가 받은 조치 전체(최신순). 보안 규칙상 userId 조건이 있어야 읽을 수 있다
export const fetchMySanctions = async (uid: string): Promise<Sanction[]> => {
	return firestoreRequest(
		'내 조치 조회',
		async () => {
			const snapshot = await getDocs(
				query(
					collection(db, 'Sanctions'),
					where('userId', '==', uid),
					orderBy('createdAt', 'desc'),
				),
			);
			return snapshot.docs.map(
				(sanctionDoc) => ({ id: sanctionDoc.id, ...sanctionDoc.data() }) as Sanction,
			);
		},
		{ throwOnError: true },
	);
};

// 경고 화면 [정책을 확인했습니다]. 다음 실행부터 경고 화면을 다시 띄우지 않는다
export const acknowledgeSanction = async (sanctionId: string): Promise<void> => {
	await firestoreRequest(
		'경고 확인',
		async () => {
			await updateDoc(doc(db, 'Sanctions', sanctionId), {
				acknowledgedAt: serverTimestamp(),
			});
		},
		{ throwOnError: true },
	);
};

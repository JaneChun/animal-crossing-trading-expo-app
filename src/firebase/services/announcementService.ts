import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';
import { Announcement, AnnouncementInput } from '@/types/announcement';

const COLLECTION = 'Announcements';

// 공지는 2~3개만 운영하므로 페이지네이션 없이 한 번에 조회한다.
// 유저는 읽기 규칙상 hidden == false 조건이 있어야 쿼리가 통과한다
const fetchAnnouncementsByHidden = async (hidden: boolean): Promise<Announcement[]> => {
	const snapshot = await getDocs(
		query(
			collection(db, COLLECTION),
			where('hidden', '==', hidden),
			orderBy('createdAt', 'desc'),
		),
	);

	return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Announcement);
};

export const fetchPublishedAnnouncements = async (): Promise<Announcement[]> => {
	return firestoreRequest('게시 중 공지 조회', () => fetchAnnouncementsByHidden(false), {
		throwOnError: true,
	});
};

export const fetchAdminAnnouncements = async (hidden: boolean): Promise<Announcement[]> => {
	return firestoreRequest('관리자 공지 목록 조회', () => fetchAnnouncementsByHidden(hidden), {
		throwOnError: true,
	});
};

export const fetchAnnouncement = async (id: string): Promise<Announcement | null> => {
	return firestoreRequest(
		'공지 조회',
		async () => {
			const docSnap = await getDoc(doc(db, COLLECTION, id));
			if (!docSnap.exists()) return null;

			return { id: docSnap.id, ...docSnap.data() } as Announcement;
		},
		{ throwOnError: true },
	);
};

export const createAnnouncement = async (input: AnnouncementInput): Promise<string> => {
	return firestoreRequest(
		'공지 작성',
		async () => {
			const docRef = await addDoc(collection(db, COLLECTION), {
				...input,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
			return docRef.id;
		},
		{ throwOnError: true },
	);
};

export const updateAnnouncement = async ({
	id,
	input,
}: {
	id: string;
	input: AnnouncementInput;
}): Promise<void> => {
	await firestoreRequest(
		'공지 수정',
		() => updateDoc(doc(db, COLLECTION, id), { ...input, updatedAt: serverTimestamp() }),
		{ throwOnError: true },
	);
};

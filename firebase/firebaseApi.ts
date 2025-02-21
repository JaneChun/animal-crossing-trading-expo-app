import { db } from '@/fbase';
import {
	DocumentData,
	Query,
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	updateDoc,
} from 'firebase/firestore';
import firestoreRequest from './firebaseInterceptor';

// DATABASE
export const getDocFromFirestore = async ({
	collection,
	id,
}: {
	collection: string;
	id: string;
}): Promise<DocumentData | null> => {
	return firestoreRequest('Firestore 문서 조회', async () => {
		const docRef = doc(db, collection, id);
		const docSnap = await getDoc(docRef);
		return docSnap.exists() ? { id, ...docSnap.data() } : null;
	});
};

export const addDocToFirestore = async ({
	directory,
	requestData,
}: {
	directory: string;
	requestData: any;
}): Promise<string> => {
	return firestoreRequest('Firestore 문서 추가', async () => {
		const docRef = await addDoc(collection(db, directory), requestData);
		return docRef.id;
	});
};

export const deleteDocFromFirestore = async ({
	id,
}: {
	id: string;
}): Promise<void> => {
	return firestoreRequest('Firestore 문서 삭제', async () => {
		const docData = await getDocFromFirestore({ collection: 'Boards', id });
		if (!docData) return;

		const images = docData.images || [];
		const docRef = doc(db, 'Boards', id);

		// 1. Firestore에서 문서 삭제
		await deleteDoc(docRef);

		// 2. Storage에서 이미지 삭제
		await Promise.all(
			images.map((imageUrl: string) => deleteObjectFromStorage(imageUrl)),
		);
	});
};

export async function updateDocToFirestore({
	id,
	collection,
	requestData,
}: {
	id: string;
	collection: string;
	requestData: any;
}): Promise<void> {
	return firestoreRequest('Firebase 문서 업데이트', async () => {
		await updateDoc(doc(db, collection, id), requestData);
	});
}

export const queryDocs = async <T extends DocumentData>(
	q: Query<DocumentData>,
): Promise<Array<T & { id: string }>> => {
	const querySnapshot = await getDocs(q);

	if (querySnapshot.empty) return [];

	return querySnapshot.docs.map((doc) => {
		const docData = doc.data() as T;
		return {
			id: doc.id,
			...docData,
		};
	});
};

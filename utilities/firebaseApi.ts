import { db, storage } from '@/fbase';
import {
	DocumentData,
	DocumentReference,
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	setDoc,
	updateDoc,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';

export const getDocFromFirestore = async ({
	collection,
	id,
}: {
	collection: string;
	id: string;
}): Promise<DocumentData | null> => {
	try {
		const docRef = doc(db, collection, id);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return { id, ...docSnap.data() };
		}
		return null;
	} catch (e) {
		console.log(`Firestore 문서 가져오기 실패 (${collection}/${id}):`, e);
		throw e;
	}
};

export const addDocToFirestore = async ({
	directory,
	requestData,
}: {
	directory: string;
	requestData: any;
}) => {
	const docRef = await addDoc(collection(db, directory), requestData);
	return docRef.id;
};

export const deleteDocFromFirestore = async ({ id }: { id: string }) => {
	const docData = await getDocFromFirestore({ collection: 'Boards', id });
	if (!docData) return;

	const images = docData.images || [];

	// 1. Storage에서 이미지 삭제
	await Promise.all(
		images.map((imageUrl: string) => deleteObjectFromStorage(imageUrl)),
	);

	// 2. Firestore에서 문서 삭제
	await deleteDoc(doc(db, 'Boards', id));
};

export const deleteObjectFromStorage = async (imageUrl: string) => {
	const imageRef = ref(storage, imageUrl);
	try {
		await deleteObject(imageRef);
	} catch (e) {
		console.log('이미지 삭제 실패:', e);
	}
};

// export async function setDataToFirestore(
// 	ref: DocumentReference,
// 	requestData: any,
// ) {
// 	await setDoc(ref, requestData);
// }

export async function updateDataToFirestore(
	ref: DocumentReference,
	requestData: any,
) {
	await updateDoc(ref, requestData);
}

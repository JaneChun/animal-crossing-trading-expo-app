import { db, storage } from '@/fbase';
import {
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

export const addDataToFirestore = async ({
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
	const docRef = doc(db, 'Boards', id);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists()) {
		const docData = docSnap.data();
		const images = docData.images || [];

		// 1. Storage에서 이미지 삭제
		await Promise.all(
			images.map((imageUrl: string) => deleteObjectFromStorage(imageUrl)),
		);

		// 2. Firestore에서 문서 삭제
		await deleteDoc(docRef);
	}
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

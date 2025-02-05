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
import {
	deleteObject,
	ref,
	getDownloadURL,
	uploadBytes,
} from 'firebase/storage';
import { ImagePickerAsset } from 'expo-image-picker';

// DATABASE
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
}): Promise<string> => {
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

// export async function setDataToFirestore(
// 	ref: DocumentReference,
// 	requestData: any,
// ) {
// 	await setDoc(ref, requestData);
// }

export async function updateDocToFirestore({
	id,
	collection,
	requestData,
}: {
	id: string;
	collection: string;
	requestData: any;
}) {
	await updateDoc(doc(db, collection, id), requestData);
}

// STORAGE
export const uploadObjectToStorage = async ({
	images,
	directory,
}: {
	images: ImagePickerAsset[];
	directory: string;
}): Promise<string[]> => {
	try {
		const uploadPromises = images.map(async (image) => {
			const fileName = `${Date.now()}_${image.fileName || 'image.jpg'}`;
			const storageRef = ref(storage, `${directory}/${fileName}`);

			const response = await fetch(image.uri); // 이미지 URL을 fetch하여 Blob 변환
			const blob = await response.blob(); // Blob(바이너리) 형태로 변환

			await uploadBytes(storageRef, blob); // Firebase Storage에 Blob 파일 업로드
			return getDownloadURL(storageRef); // 업로드 후 다운로드 URL 반환
		});

		const downloadURLs = await Promise.all(uploadPromises);
		console.log('이미지 업로드 완료');
		return downloadURLs;
	} catch (e) {
		console.log('이미지 업로드 실패:', e);
		return [];
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

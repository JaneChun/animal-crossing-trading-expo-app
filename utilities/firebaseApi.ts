import { db } from '@/fbase';
import {
	DocumentReference,
	addDoc,
	collection,
	setDoc,
	updateDoc,
} from 'firebase/firestore';

export async function addDataToFirestore({
	directory,
	requestData,
}: {
	directory: string;
	requestData: any;
}) {
	const docRef = await addDoc(collection(db, directory), requestData);
	return docRef.id;
}

// export async function setDataToFirestore(
// 	ref: DocumentReference,
// 	requestData: any,
// ) {
// 	await setDoc(ref, requestData);
// }

// export async function updateDataToFirestore(
// 	ref: DocumentReference,
// 	requestData: any,
// ) {
// 	await updateDoc(ref, requestData);
// }

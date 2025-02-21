import { UserInfo } from '@/contexts/AuthContext';
import { db, storage } from '@/fbase';
import { ImagePickerAsset } from 'expo-image-picker';
import {
	DocumentData,
	Query,
	Timestamp,
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	increment,
	query,
	setDoc,
	updateDoc,
	where,
	writeBatch,
} from 'firebase/firestore';
import {
	deleteObject,
	getDownloadURL,
	ref,
	uploadBytes,
} from 'firebase/storage';
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

// DATABASE - USER
export const saveUserToFirestore = async ({
	uid,
	displayName,
	photoURL,
}: {
	uid: string;
	displayName: string;
	photoURL: string;
}): Promise<void> => {
	return firestoreRequest('유저 정보 저장', async () => {
		await setDoc(
			doc(db, 'Users', uid),
			{
				displayName: displayName ?? '',
				photoURL: photoURL ?? '',
				islandName: '',
				createdAt: new Date(),
				lastLogin: new Date(),
			},
			{ merge: true },
		);
	});
};

export const getUserInfoFromFirestore = async ({
	uid,
}: {
	uid: string;
}): Promise<UserInfo> => {
	return firestoreRequest('내 유저 정보 조회', async () => {
		const userRef = doc(db, 'Users', uid);
		const userSnap = await getDoc(userRef);

		if (userSnap.exists()) {
			const fullUserInfo = userSnap.data(); // Firestore에 저장된 유저 데이터 반환
			const { displayName, photoURL, islandName, createdAt, lastLogin } =
				fullUserInfo;

			return { uid, displayName, photoURL, islandName, createdAt, lastLogin };
		} else {
			return null; // Firestore에 데이터 없음
		}
	});
};

// STORAGE
export const uploadObjectToStorage = async ({
	images,
	directory,
}: {
	images: ImagePickerAsset[];
	directory: string;
}): Promise<string[]> => {
	return firestoreRequest('Storage 이미지 업로드', async () => {
		const uploadPromises = images.map(async (image) => {
			const fileName = `${Date.now()}_${image.fileName || 'image.jpg'}`;
			const storageRef = ref(storage, `${directory}/${fileName}`);

			const response = await fetch(image.uri); // 이미지 URL을 fetch하여 Blob 변환
			const blob = await response.blob(); // Blob(바이너리) 형태로 변환

			await uploadBytes(storageRef, blob); // Firebase Storage에 Blob 파일 업로드

			return getDownloadURL(storageRef); // 업로드 후 다운로드 URL 반환
		});

		const downloadURLs = await Promise.all(uploadPromises);

		return downloadURLs.filter((url) => url !== null);
	});
};

export const deleteObjectFromStorage = async (
	imageUrl: string,
): Promise<void> => {
	return firestoreRequest('Storage 이미지 삭제', async () => {
		const imageRef = ref(storage, imageUrl);
		await deleteObject(imageRef);
	});
};

// PUBLIC USERINFO
export type PublicUserInfo = {
	uid: string;
	displayName: string;
	islandName: string;
	photoURL: string;
};

export const getPublicUserInfo = async (
	creatorId: string,
): Promise<PublicUserInfo> => {
	try {
		return firestoreRequest('유저 정보 조회', async () => {
			const docData = await getDocFromFirestore({
				collection: 'Users',
				id: creatorId,
			});

			if (!docData) {
				return getDefaultPublicUserInfo(creatorId);
			}

			return {
				uid: creatorId,
				displayName: docData.displayName || 'Unknown User',
				islandName: docData.islandName || '',
				photoURL: docData.photoURL || '',
			};
		});
	} catch (e) {
		return getDefaultPublicUserInfo(creatorId);
	}
};

const getDefaultPublicUserInfo = (uid: string): PublicUserInfo => ({
	uid,
	displayName: 'Unknown User',
	islandName: '',
	photoURL: '',
});

export const getPublicUserInfos = async (
	creatorIds: string[],
): Promise<Record<string, PublicUserInfo>> => {
	return firestoreRequest('유저 정보 일괄 조회', async () => {
		if (creatorIds.length === 0) return {};

		const usersRef = collection(db, 'Users');
		const q = query(usersRef, where('__name__', 'in', creatorIds));

		const usersData = await queryDocs(q);

		// 유저 정보를 ID 기반 객체로 변환
		const publicUserInfoMap: Record<string, PublicUserInfo> = {};
		usersData.forEach((user) => {
			publicUserInfoMap[user.id] = {
				uid: user.id,
				displayName: user.displayName || 'Unknown User',
				islandName: user.islandName || '',
				photoURL: user.photoURL || '',
			};
		});

		return publicUserInfoMap;
	});
};

// COMMENT
export const addComment = async ({
	postId,
	commentData,
}: {
	postId: string;
	commentData: any;
}): Promise<void> => {
	return firestoreRequest('댓글 추가', async () => {
		const batch = writeBatch(db);

		// 1. 댓글 문서 추가
		const commentRef = doc(collection(db, 'Boards', postId, 'Comments')); // Boards/{postId}/Comments 서브컬렉션
		batch.set(commentRef, commentData);

		// 2. post 문서의 commentCount 필드 수정
		const postRef = doc(db, 'Boards', postId);
		batch.update(postRef, { commentCount: increment(1) });

		await batch.commit();
	});
};

export const updateComment = async ({
	postId,
	commentId,
	newCommentText,
}: {
	postId: string;
	commentId: string;
	newCommentText: string;
}): Promise<void> => {
	return firestoreRequest('댓글 수정', async () => {
		// 1. 댓글 문서 수정
		const commentRef = doc(db, 'Boards', postId, 'Comments', commentId);
		await updateDoc(commentRef, {
			body: newCommentText,
			updatedAt: Timestamp.now(),
		});
	});
};

export const deleteComment = async ({
	postId,
	commentId,
}: {
	postId: string;
	commentId: string;
}): Promise<void> => {
	return firestoreRequest('댓글 삭제', async () => {
		const batch = writeBatch(db);

		// 1. 댓글 문서 삭제
		const commentRef = doc(db, 'Boards', postId, 'Comments', commentId);
		batch.delete(commentRef);

		// 2. post 문서의 commentCount 필드 수정
		const postRef = doc(db, 'Boards', postId);
		batch.update(postRef, { commentCount: increment(-1) });

		await batch.commit();
	});
};

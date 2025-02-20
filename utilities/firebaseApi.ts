import { UserInfo } from '@/contexts/AuthContext';
import { db, storage } from '@/fbase';
import { ImagePickerAsset } from 'expo-image-picker';
import {
	DocumentData,
	Timestamp,
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	getDoc,
	increment,
	setDoc,
	updateDoc,
	writeBatch,
} from 'firebase/firestore';
import {
	deleteObject,
	getDownloadURL,
	ref,
	uploadBytes,
} from 'firebase/storage';
import { Alert } from 'react-native';

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

// DATABASE - USER
export const saveUserToFirestore = async ({
	uid,
	displayName,
	photoURL,
}: {
	uid: string;
	displayName: string;
	photoURL: string;
}) => {
	await setDoc(
		doc(db, 'Users', uid),
		{
			displayName: displayName ?? '',
			photoURL: photoURL ?? '',
			islandName: '', // 기본값
			createdAt: new Date(),
			lastLogin: new Date(),
		},
		{ merge: true },
	);
};

export const getUserInfoFromFirestore = async ({
	uid,
}: {
	uid: string;
}): Promise<UserInfo> => {
	try {
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
	} catch (e: any) {
		console.log('Firestore에서 유저 정보 가져오기 실패:', e);

		if (e.code === 'unavailable' || e.code === 'network-request-failed') {
			Alert.alert('네트워크 오류', '인터넷 연결을 확인해주세요.');
		}

		return null;
	}
};

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

// USERINFO
export const getCreatorInfo = async (
	creatorId: string,
): Promise<{
	creatorDisplayName: string;
	creatorIslandName: string;
	creatorPhotoURL: string;
}> => {
	try {
		const docData = await getDocFromFirestore({
			collection: 'Users',
			id: creatorId,
		});

		if (!docData) {
			return getDefaultCreatorInfo();
		}

		return {
			creatorDisplayName: docData.displayName || 'Unknown User',
			creatorIslandName: docData.islandName || '',
			creatorPhotoURL: docData.photoURL || '',
		};
	} catch (e) {
		console.log(`${creatorId} creatorInfo 조회 실패:`, e);
		return getDefaultCreatorInfo();
	}
};

const getDefaultCreatorInfo = () => ({
	creatorDisplayName: 'Unknown User',
	creatorIslandName: '',
	creatorPhotoURL: '',
});

// COMMENT
export const addComment = async ({
	postId,
	commentData,
}: {
	postId: string;
	commentData: any;
}) => {
	const batch = writeBatch(db);

	try {
		// 댓글 문서 추가
		const commentRef = doc(collection(db, 'Boards', postId, 'Comments')); // Boards/{postId}/Comments 서브컬렉션
		batch.set(commentRef, commentData);

		// post 문서의 commentCount 필드 수정
		const postRef = doc(db, 'Boards', postId);
		batch.update(postRef, { commentCount: increment(1) });

		await batch.commit();
		console.log('댓글 추가 및 게시글 댓글 수 증가 완료');
	} catch (e: any) {
		console.log('댓글 추가 중 오류 발생:', e);
		throw new Error(e);
	}
};

export const updateComment = async ({
	postId,
	commentId,
	newCommentText,
}: {
	postId: string;
	commentId: string;
	newCommentText: string;
}) => {
	try {
		// 댓글 문서 수정
		const commentRef = doc(db, 'Boards', postId, 'Comments', commentId);
		await updateDoc(commentRef, {
			body: newCommentText,
			updatedAt: Timestamp.now(),
		});
		console.log('댓글 수정 완료');
	} catch (e: any) {
		console.log(' 댓글 수정 중 오류 발생:', e);
		throw new Error(e);
	}
};

export const deleteComment = async ({
	postId,
	commentId,
}: {
	postId: string;
	commentId: string;
}) => {
	const batch = writeBatch(db);

	try {
		// 댓글 문서 삭제
		const commentRef = doc(db, 'Boards', postId, 'Comments', commentId);
		batch.delete(commentRef);

		// post 문서의 commentCount 필드 수정
		const postRef = doc(db, 'Boards', postId);
		batch.update(postRef, { commentCount: increment(-1) });

		await batch.commit();
		console.log('댓글 추가 및 게시글 댓글 수 감소 완료');
	} catch (e: any) {
		console.log(' 댓글 삭제 중 오류 발생:', e);
		throw new Error(e);
	}
};

// CHAT
export const createChatRoom = async (user1: string, user2: string) => {
	const chatId = generateChatId(user1, user2);
	const chatRef = doc(db, 'Chats', chatId);

	try {
		const chatSnap = await getDoc(chatRef);

		// 채팅방이 존재하지 않으면 새로 생성
		if (!chatSnap.exists()) {
			await setDoc(chatRef, {
				id: chatId,
				participants: [user1, user2],
				lastMessage: '',
				lastMessageSenderId: '',
				updatedAt: Timestamp.now(),
			});
			console.log(`새 채팅방 생성: ${chatId}`);
		} else {
			// 기존 채팅방이 있는데, 사용자가 나간 채팅방이라면 (participants 배열에 없다면) 다시 추가
			const participants = chatSnap.data().participants;
			if (!participants.includes(user1)) {
				await rejoinChatRoom({ chatId });
			} else {
				console.log(`기존 채팅방 사용: ${chatId}`);
			}
		}

		return chatId;
	} catch (e) {
		console.log('채팅방 생성 중 오류:', e);
		throw new Error('채팅방을 생성할 수 없습니다.');
	}
};

const generateChatId = (user1: string, user2: string): string => {
	return [user1, user2].sort().join('_');
};

export const sendMessage = async ({
	chatId,
	senderId,
	message,
}: {
	chatId: string;
	senderId: string;
	message: string;
}) => {
	if (!chatId || !senderId || !message.trim()) return;

	try {
		// 1. 메세지 추가
		const messageRef = collection(db, 'Chats', chatId, 'Messages'); // Boards/{chatId}/Messages 서브컬렉션

		await addDoc(messageRef, {
			body: message,
			senderId,
			createdAt: Timestamp.now(),
		});

		// 2. 채팅방 정보 업데이트 (최근 메시지, 보낸 사람, 시간)
		const chatRef = doc(db, 'Chats', chatId);
		await updateDoc(chatRef, {
			lastMessage: message,
			lastMessageSenderId: senderId,
			updatedAt: Timestamp.now(),
		});
	} catch (e: any) {
		console.log('메시지 전송 오류:', e);
		throw new Error(e);
	}
};

export const leaveChatRoom = async ({
	chatId,
	userId,
}: {
	chatId: string;
	userId: string;
}) => {
	try {
		const chatRef = doc(db, 'Chats', chatId);

		await updateDoc(chatRef, {
			participants: arrayRemove(userId),
		});

		console.log(`${userId} 유저가 채팅방을 나갔습니다.`);
	} catch (e: any) {
		console.log('채팅방 나가기 중 오류 발생:', e);
		throw new Error(e);
	}
};

export const rejoinChatRoom = async ({ chatId }: { chatId: string }) => {
	const users = chatId.split('_');

	try {
		const chatRef = doc(db, 'Chats', chatId);

		await updateDoc(chatRef, {
			participants: arrayUnion(...users),
		});

		console.log(`${JSON.stringify(users)} 유저가 채팅방에 다시 참여했습니다.`);
	} catch (e: any) {
		console.log('채팅방 다시 참여 중 오류 발생:', e);
		throw new Error(e);
	}
};

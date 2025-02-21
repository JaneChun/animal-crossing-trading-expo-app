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

// USERINFO
export const getCreatorInfo = async (
	creatorId: string,
): Promise<{
	creatorDisplayName: string;
	creatorIslandName: string;
	creatorPhotoURL: string;
}> => {
	try {
		return firestoreRequest('타 유저 정보 조회', async () => {
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
		});
	} catch (e) {
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

// CHAT
export const createChatRoom = async (
	user1: string,
	user2: string,
): Promise<string | undefined> => {
	return firestoreRequest('채팅방 생성', async () => {
		const chatId = generateChatId(user1, user2);

		const chatRef = doc(db, 'Chats', chatId);
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
			const participants = chatSnap.data().participants;

			// 기존 채팅방이 있는데, 사용자가 나간 채팅방이라면 (participants 배열에 없다면) 다시 추가
			if (!participants.includes(user1)) {
				await rejoinChatRoom({ chatId });
			} else {
				console.log(`기존 채팅방 사용: ${chatId}`);
			}
		}

		return chatId;
	});
};

const generateChatId = (user1: string, user2: string): string => {
	return [user1, user2].sort().join('_');
};

export const sendMessage = async ({
	chatId,
	senderId,
	receiverId,
	message,
}: {
	chatId: string;
	senderId: string;
	receiverId: string;
	message: string;
}): Promise<void> => {
	return firestoreRequest('메세지 전송', async () => {
		if (!chatId || !senderId || !receiverId || !message.trim()) return;

		// 1. 메세지 추가
		const messageRef = collection(db, 'Chats', chatId, 'Messages'); // Boards/{chatId}/Messages 서브컬렉션

		await addDoc(messageRef, {
			body: message,
			senderId,
			createdAt: Timestamp.now(),
			isReadBy: [senderId],
		});

		// 2. 채팅방 정보 업데이트 (최근 메시지, 보낸 사람, 시간)
		const chatRef = doc(db, 'Chats', chatId);
		await updateDoc(chatRef, {
			lastMessage: message,
			lastMessageSenderId: senderId,
			updatedAt: Timestamp.now(),
			[`unreadCount.${receiverId}`]: increment(1), // 상대 유저의 unreadCount 1 증가
		});
	});
};

export const leaveChatRoom = async ({
	chatId,
	userId,
}: {
	chatId: string;
	userId: string;
}): Promise<void> => {
	return firestoreRequest('채팅방 나가기', async () => {
		const chatRef = doc(db, 'Chats', chatId);

		await updateDoc(chatRef, {
			participants: arrayRemove(userId),
		});
	});
};

export const rejoinChatRoom = async ({
	chatId,
}: {
	chatId: string;
}): Promise<void> => {
	return firestoreRequest('채팅방 재입장', async () => {
		const users = chatId.split('_');
		const chatRef = doc(db, 'Chats', chatId);

		await updateDoc(chatRef, {
			participants: arrayUnion(...users),
		});
	});
};

export const markMessagesAsRead = async ({
	chatId,
	userId,
}: {
	chatId: string;
	userId: string;
}): Promise<void> => {
	return firestoreRequest('메세지 읽음 처리', async () => {
		const messagesRef = collection(db, `Chats/${chatId}/Messages`);

		// 0. 안 읽은 메시지만 가져오기
		const q = query(messagesRef, where('isReadBy', 'not-in', [userId]));
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) return;

		const batch = writeBatch(db);

		// 1. 메세지별 읽음 처리
		querySnapshot.docs.forEach((messageDoc) => {
			const messageRef = doc(db, `Chats/${chatId}/Messages/${messageDoc.id}`);
			batch.update(messageRef, {
				isReadBy: arrayUnion(userId), // 내가 읽었다고 추가
			});
		});

		// 2. 채팅방 정보도 업데이트 (내 unreadCount 초기화)
		const chatRef = doc(db, `Chats/${chatId}`);
		batch.update(chatRef, {
			[`unreadCount.${userId}`]: 0,
		});

		await batch.commit();
	});
};

export const reportError = async (
	errorMessage: string,
	errorStack: string,
): Promise<void> => {
	return firestoreRequest('에러 리포트', async () => {
		await addDoc(collection(db, 'Errors'), {
			message: errorMessage,
			stack: errorStack,
			timestamp: Timestamp.now(),
			platform: 'React Native Expo',
		});
	});
};

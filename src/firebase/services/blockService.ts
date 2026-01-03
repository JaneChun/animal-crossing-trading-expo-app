import { db } from '@/config/firebase';
import { deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';

export const blockUser = async ({
	userId,
	targetUserId,
}: {
	userId: string;
	targetUserId: string;
}) => {
	return firestoreRequest('사용자 차단', async () => {
		// Users/{userId}/BlockedUsers 서브컬렉션
		const blockedUserDocRef = doc(
			db,
			'Users',
			userId,
			'BlockedUsers',
			targetUserId,
		);

		await setDoc(blockedUserDocRef, {
			blockedAt: Timestamp.now(),
		});
	});
};

export const unblockUser = async ({
	userId,
	targetUserId,
}: {
	userId: string;
	targetUserId: string;
}) => {
	return firestoreRequest('사용자 차단 해제', async () => {
		const blockedUserDocRef = doc(
			db,
			'Users',
			userId,
			'BlockedUsers',
			targetUserId,
		);

		await deleteDoc(blockedUserDocRef);
	});
};

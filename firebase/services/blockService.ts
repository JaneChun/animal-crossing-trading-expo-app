import { showToast } from '@/components/ui/Toast';
import { db } from '@/fbase';
import { BlockUserParams } from '@/types/user';
import { deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { Alert } from 'react-native';
import firestoreRequest from '../core/firebaseInterceptor';

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

export const handleBlockUser = async ({
	userId,
	blockUserId,
	blockUserDisplayName,
}: BlockUserParams) => {
	if (!blockUserId || !userId) return;

	Alert.alert(
		'상대방을 차단할까요?',
		'차단한 사용자의 게시물은 보이지 않고, 나에게 댓글과 채팅을 보낼 수 없어요.',
		[
			{ text: '취소', style: 'cancel' },
			{
				text: '네, 차단할게요',
				onPress: async () => {
					await blockUser({
						userId,
						targetUserId: blockUserId,
					});

					showToast('success', `${blockUserDisplayName}님을 차단했어요.`);
				},
			},
		],
	);
};

export const handleUnblockUser = async ({
	userId,
	blockUserId,
	blockUserDisplayName,
}: BlockUserParams) => {
	if (!blockUserId || !userId) return;

	await unblockUser({
		userId,
		targetUserId: blockUserId,
	});

	showToast('success', `${blockUserDisplayName}님을 차단 해제했어요.`);
};

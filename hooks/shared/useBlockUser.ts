import { showToast } from '@/components/ui/Toast';
import { blockUser, unblockUser } from '@/firebase/services/blockService';
import { useUserInfo } from '@/stores/auth';
import { useBlockStore } from '@/stores/block';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import { useCallback } from 'react';
import { Alert } from 'react-native';

export function useBlockUser({
	targetUserId,
	targetUserDisplayName,
}: {
	targetUserId?: string;
	targetUserDisplayName?: string;
}) {
	const userInfo = useUserInfo();
	const blockedUsers = useBlockStore((state) => state.blockedUsers);

	const isBlockedByMe = !!(targetUserId && blockedUsers.includes(targetUserId));

	const handleBlockUser = useCallback(() => {
		if (!userInfo) {
			showToast('warn', '차단은 로그인 후 가능합니다.');
			navigateToLogin();
			return;
		}

		if (!targetUserId || !targetUserDisplayName) {
			showToast('error', '차단 대상을 찾을 수 없습니다.');
			return;
		}

		if (targetUserId === userInfo.uid) {
			showToast('error', '본인을 차단할 수 없습니다.');
			return;
		}

		Alert.alert(
			'상대방을 차단할까요?',
			'차단한 사용자의 게시물은 보이지 않고, 나에게 댓글과 채팅을 보낼 수 없어요.',
			[
				{ text: '취소', style: 'cancel' },
				{
					text: '네, 차단할게요',
					onPress: async () => {
						await blockUser({
							userId: userInfo.uid,
							targetUserId,
						});
						showToast('success', `${targetUserDisplayName}님을 차단했어요.`);
					},
				},
			],
		);
	}, [userInfo, targetUserId, targetUserDisplayName]);

	const handleUnblockUser = useCallback(() => {
		if (!userInfo) {
			showToast('warn', '차단해제는 로그인 후 가능합니다.');
			navigateToLogin();
			return;
		}

		if (!targetUserId || !targetUserDisplayName) {
			showToast('error', '차단 해제 대상을 찾을 수 없습니다.');
			return;
		}

		if (targetUserId === userInfo.uid) {
			showToast('error', '본인을 차단 해제할 수 없습니다.');
			return;
		}

		Alert.alert(
			'차단을 해제할까요?',
			`${targetUserDisplayName}님을 차단 해제하면 게시물이 다시 보이고, 댓글/채팅이 가능해집니다.`,
			[
				{ text: '취소', style: 'cancel' },
				{
					text: '네, 해제할게요',
					onPress: async () => {
						await unblockUser({
							userId: userInfo.uid,
							targetUserId,
						});
						showToast(
							'success',
							`${targetUserDisplayName}님 차단을 해제했어요.`,
						);
					},
				},
			],
		);
	}, [userInfo, targetUserId, targetUserDisplayName]);

	// 현재 상태에 따라 block/unblock 자동 호출
	const toggleBlock = useCallback(() => {
		isBlockedByMe ? handleUnblockUser() : handleBlockUser();
	}, [isBlockedByMe, handleBlockUser, handleUnblockUser]);

	return {
		isBlockedByMe,
		block: handleBlockUser,
		unblock: handleUnblockUser,
		toggleBlock,
	};
}

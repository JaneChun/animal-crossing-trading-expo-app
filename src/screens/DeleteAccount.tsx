import Button from '@/components/ui/Button';
import CloseButton from '@/components/ui/CloseButton';
import { PADDING } from '@/components/ui/layout/Layout';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { Colors } from '@/constants/Color'; // 프로젝트 컬러 상수
import { pop } from '@/navigation/RootNavigation';
import { useAuthStore, useUserInfo } from '@/stores/auth';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const guideList = [
	{
		title: '작성한 콘텐츠는 삭제되지 않아요 📝',
		description:
			'탈퇴 후에도 작성한 게시글, 댓글, 채팅은 삭제되지 않으며, 다른 사용자에게는 "탈퇴한 사용자"로 표시됩니다.',
	},
	{
		title: '재가입하면 그대로 복구돼요 🔄',
		description:
			'같은 소셜 계정으로 재가입하면, 이전에 작성한 모든 콘텐츠가 다시 복구됩니다.',
	},
	{
		title: '30일 동안 재가입이 제한돼요 ⏳',
		description:
			'탈퇴 후에는 같은 소셜 계정으로 30일 동안 다시 가입할 수 없습니다. 신중히 결정해주세요.',
	},
];

const DeleteAccount = () => {
	const userInfo = useUserInfo();
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
	const kakaoDeleteAccount = useAuthStore((state) => state.kakaoDeleteAccount);
	const naverDeleteAccount = useAuthStore((state) => state.naverDeleteAccount);
	const appleDeleteAccount = useAuthStore((state) => state.appleDeleteAccount);

	const handleDeleteAccount = async () => {
		Alert.alert(
			'탈퇴 전 안내사항을 모두 확인하셨나요?',
			'작성한 콘텐츠는 삭제되지 않으며, 같은 계정으로는 30일간 재가입할 수 없습니다.',
			[
				{ text: '취소', style: 'cancel' },
				{
					text: '네, 탈퇴할게요',
					onPress: onConfirmDeleteAccount,
				},
			],
		);
	};

	const onConfirmDeleteAccount = async () => {
		if (!userInfo) return;

		let isSuccess: boolean | void = false;

		if (userInfo.oauthType === 'kakao')
			isSuccess = await kakaoDeleteAccount(userInfo.uid);
		else if (userInfo.oauthType === 'naver')
			isSuccess = await naverDeleteAccount(userInfo.uid);
		else if (userInfo.oauthType === 'apple')
			isSuccess = await appleDeleteAccount(userInfo.uid);

		if (Boolean(isSuccess)) {
			Alert.alert('탈퇴 완료', '회원 탈퇴가 완료되었습니다.');
			backToProfile();
		} else {
			Alert.alert('탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
			backToProfile();
		}
	};

	const backToAccount = () => {
		pop(3);
	};

	const backToProfile = () => {
		pop(4);
	};

	if (isAuthLoading) {
		return <LoadingIndicator />;
	}

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<LayoutWithHeader
				headerRightComponent={<CloseButton onPress={backToAccount} />}
				hasBorderBottom={false}
			>
				<View style={styles.container}>
					<Text style={styles.title}>
						{'탈퇴 전, 아래 내용을\n꼭 확인해주세요'}
					</Text>
					<Text style={styles.subtitle}>탈퇴 시 유의사항 안내</Text>

					{guideList.map((item, index) => (
						<View key={index} style={styles.infoBox}>
							<Text style={styles.infoTitle}>{item.title}</Text>
							<Text style={styles.infoDescription}>{item.description}</Text>
						</View>
					))}
					<View style={styles.bottom}>
						<View style={styles.buttonsContainer}>
							<Button onPress={backToAccount} color='gray' size='lg2' flex>
								취소
							</Button>
							<Button
								onPress={handleDeleteAccount}
								color='mint'
								size='lg2'
								flex
							>
								탈퇴할래요
							</Button>
						</View>
					</View>
				</View>
			</LayoutWithHeader>
		</SafeAreaView>
	);
};

export default DeleteAccount;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
		padding: PADDING,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 8,
		color: Colors.font_black,
	},
	subtitle: {
		fontSize: 14,
		color: Colors.font_gray,
		marginBottom: 24,
	},
	infoBox: {
		backgroundColor: Colors.base,
		borderRadius: 10,
		padding: 16,
		marginBottom: 16,
	},
	infoTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: Colors.font_black,
		marginBottom: 6,
	},
	infoDescription: {
		fontSize: 14,
		color: Colors.font_gray,
		lineHeight: 18,
	},
	bottom: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	buttonsContainer: {
		marginTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
});

import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { pop } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { navigateToSocialAccountCheck } from '@/utilities/navigationHelpers';
import { Alert, StyleSheet, Text, View } from 'react-native';
import SettingListItem from './SettingListItem';

const Account = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const kakaoLogout = useAuthStore((state) => state.kakaoLogout);
	const naverLogout = useAuthStore((state) => state.naverLogout);
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

	const handleLogout = () => {
		Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
			{ text: '닫기', style: 'cancel' },
			{ text: '로그아웃', onPress: onConfirmLogout },
		]);
	};

	const onConfirmLogout = async () => {
		if (!userInfo) return;

		let isSuccess: boolean | void = false;

		if (userInfo.oauthType === 'kakao') isSuccess = await kakaoLogout();
		else if (userInfo.oauthType === 'naver') isSuccess = await naverLogout();

		if (Boolean(isSuccess)) {
			backToProfile();
			showToast('success', '로그아웃되었습니다.');
		} else {
			showToast('error', '로그아웃 실패. 다시 시도해주세요.');
		}
	};

	const backToProfile = () => {
		pop(2);
	};

	if (isAuthLoading) return <LoadingIndicator />;

	return (
		<View style={styles.screen}>
			<View style={styles.container}>
				<SettingListItem borderRound='all'>
					<>
						<Text style={styles.text}>이메일</Text>
						<Text style={[styles.text, { color: Colors.font_dark_gray }]}>
							{userInfo?.email}
						</Text>
					</>
				</SettingListItem>
			</View>
			<View style={styles.container}>
				<SettingListItem borderRound='top' onPress={handleLogout}>
					<Text style={styles.text}>로그아웃</Text>
				</SettingListItem>
				<SettingListItem
					borderRound='bottom'
					showChevron
					onPress={navigateToSocialAccountCheck}
				>
					<Text style={styles.text}>탈퇴하기</Text>
				</SettingListItem>
			</View>
		</View>
	);
};

export default Account;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
		padding: PADDING,
	},
	container: {
		marginBottom: 32,
	},
	title: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		marginBottom: 16,
	},
	text: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.regular,
	},
});

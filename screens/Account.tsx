import Apple from '@/components/ui/Icons/Apple';
import Kakao from '@/components/ui/Icons/Kakao';
import Naver from '@/components/ui/Icons/Naver';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { pop } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import {
	navigateToDeleteAccount,
	navigateToSocialAccountCheck,
} from '@/utilities/navigationHelpers';
import { Alert, StyleSheet, Text, View } from 'react-native';
import SettingListItem from '../components/Profile/SettingListItem';

const Account = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const kakaoLogout = useAuthStore((state) => state.kakaoLogout);
	const naverLogout = useAuthStore((state) => state.naverLogout);
	const appleLogout = useAuthStore((state) => state.appleLogout);
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
		else if (userInfo.oauthType === 'apple') isSuccess = await appleLogout();

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

	const handleNavigateToDeleteAccount = () => {
		if (!userInfo) return;

		if (userInfo.oauthType === 'kakao' || userInfo.oauthType === 'naver') {
			navigateToSocialAccountCheck();
		} else if (userInfo.oauthType === 'apple') {
			navigateToDeleteAccount();
		}
	};

	if (isAuthLoading) return <LoadingIndicator />;

	return (
		<View style={styles.screen}>
			<View style={styles.container}>
				<SettingListItem borderRound='all'>
					<View style={styles.emailRow}>
						<Text style={styles.text}>이메일</Text>
						<View style={styles.email}>
							{userInfo?.oauthType === 'naver' ? (
								<Naver style={styles.icon} />
							) : userInfo?.oauthType === 'kakao' ? (
								<Kakao style={styles.icon} />
							) : (
								<Apple style={styles.appleIcon} />
							)}
							<Text
								numberOfLines={1}
								ellipsizeMode='tail'
								style={[styles.text, styles.emailText]}
							>
								{userInfo?.email}
							</Text>
						</View>
					</View>
				</SettingListItem>
			</View>
			<View style={styles.container}>
				<SettingListItem
					borderRound='top'
					onPress={handleLogout}
					testID='logoutButton'
				>
					<Text style={styles.text}>로그아웃</Text>
				</SettingListItem>
				<SettingListItem
					borderRound='bottom'
					showChevron
					onPress={handleNavigateToDeleteAccount}
					testID='deleteAccountButton'
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
	emailRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 16,
	},
	email: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		gap: 6,
	},
	icon: {
		width: 16,
		height: 16,
	},
	appleIcon: {
		width: 14,
		height: 14,
	},
	emailText: {
		flexShrink: 1,
		color: Colors.font_dark_gray,
	},
});

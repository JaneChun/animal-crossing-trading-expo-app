import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CloseButton from '@/components/ui/CloseButton';
import { PADDING } from '@/components/ui/layout/Layout';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import SocialLoginButton from '@/components/ui/SocialLoginButton';
import Text from '@/components/ui/Text';
import { showToast } from '@/components/ui/Toast';
import { auth } from '@/config/firebase';
import { pop, popToTop } from '@/navigation/RootNavigation';
import { LoginResult, useAuthStore, useUserInfo } from '@/stores/auth';
import { Theme, useThemedStyles } from '@/theme';
// 프로젝트 컬러 상수
import { OauthType } from '@/types/user';
import { navigateToDeleteAccount } from '@/utilities/navigationHelpers';

const SocialAccountCheck = () => {
	const styles = useThemedStyles(makeStyles);
	const userInfo = useUserInfo();
	const kakaoLogin = useAuthStore((state) => state.kakaoLogin);
	const naverLogin = useAuthStore((state) => state.naverLogin);
	const googleLogin = useAuthStore((state) => state.googleLogin);
	const kakaoLogout = useAuthStore((state) => state.kakaoLogout);
	const naverLogout = useAuthStore((state) => state.naverLogout);
	const googleLogout = useAuthStore((state) => state.googleLogout);
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

	const handleLogin = async (oauthType: OauthType) => {
		// 재인증 도중 다른 계정으로 로그인하면 userInfo가 바뀔 수 있으므로 로그인 전에 원래 uid를 저장
		const originalUid = userInfo?.uid;

		let loginResult: LoginResult = {
			isSuccess: false,
			isNewUser: false,
			email: '',
		};

		if (oauthType === 'kakao') loginResult = await kakaoLogin();
		else if (oauthType === 'naver') loginResult = await naverLogin();
		else if (oauthType === 'google') loginResult = await googleLogin();

		if (!loginResult.isSuccess) return;

		// 가입한 계정과 다른 계정으로 인증하면 세션이 섞이므로 로그아웃하고 탈퇴를 중단
		const isSameAccount = auth.currentUser?.uid === originalUid;
		if (!isSameAccount) {
			if (oauthType === 'kakao') await kakaoLogout();
			else if (oauthType === 'naver') await naverLogout();
			else if (oauthType === 'google') await googleLogout();

			showToast('error', '가입한 계정과 다른 계정입니다. 다시 로그인해주세요.');
			popToTop(); // 프로필 탭으로 복귀 (로그아웃 상태라 로그인 화면이 렌더링됨)
			return;
		}

		navigateToDeleteAccount();
	};

	const backToAccount = () => {
		pop(2);
	};

	if (isAuthLoading) return <LoadingIndicator />;

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<LayoutWithHeader
				headerRightComponent={<CloseButton onPress={backToAccount} />}
				hasBorderBottom={false}
			>
				<View style={styles.container}>
					<Text variant="title" weight="bold" style={styles.title}>
						{'계정 확인을 위한\n본인 인증이 필요해요'}
					</Text>
					<Text variant="body2" color="tertiary" style={styles.subtitle}>
						계정 확인 후 탈퇴 절차를 이어갈게요
					</Text>

					<View style={styles.bottom}>
						{userInfo?.oauthType === 'naver' ? (
							<SocialLoginButton
								oauthType="naver"
								onPress={() => handleLogin('naver')}
								style={{ height: 50 }}
							/>
						) : userInfo?.oauthType === 'google' ? (
							<SocialLoginButton
								oauthType="google"
								onPress={() => handleLogin('google')}
								style={{ height: 50 }}
							/>
						) : (
							<SocialLoginButton
								oauthType="kakao"
								onPress={() => handleLogin('kakao')}
								style={{ height: 50 }}
							/>
						)}
					</View>
				</View>
			</LayoutWithHeader>
		</SafeAreaView>
	);
};

export default SocialAccountCheck;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		container: {
			flex: 1,
			padding: PADDING,
		},
		title: {
			marginBottom: 8,
		},
		subtitle: {
			marginBottom: 24,
		},
		bottom: {
			flex: 1,
			justifyContent: 'flex-end',
		},
	});

import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CloseButton from '@/components/ui/CloseButton';
import { PADDING } from '@/components/ui/layout/Layout';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import SocialLoginButton from '@/components/ui/SocialLoginButton';
import Text from '@/components/ui/Text';
import { pop } from '@/navigation/RootNavigation';
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
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

	const handleLogin = async (oauthType: OauthType) => {
		let loginResult: LoginResult = {
			isSuccess: false,
			isNewUser: false,
			email: '',
		};

		if (oauthType === 'kakao') loginResult = await kakaoLogin();
		else if (oauthType === 'naver') loginResult = await naverLogin();

		if (loginResult.isSuccess) {
			navigateToDeleteAccount();
		}
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
			fontSize: 22,
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

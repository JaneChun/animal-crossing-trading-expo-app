import { PADDING } from '@/components/ui/layout/Layout';
import SocialLoginButton from '@/components/ui/SocialLoginButton';
import { showToast } from '@/components/ui/Toast';
import { auth } from '@/config/firebase';
import { LoginResult, useAuthStore } from '@/stores/auth';
import { OauthType } from '@/types/user';
import {
	navigateToAgreeToTermsAndConditions,
	replaceToMyProfile,
} from '@/utilities/navigationHelpers';
import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

const Login = () => {
	const kakaoLogin = useAuthStore((state) => state.kakaoLogin);
	const naverLogin = useAuthStore((state) => state.naverLogin);
	const appleLogin = useAuthStore((state) => state.appleLogin);

	const handleLogin = async (oauthType: OauthType) => {
		let loginResult: LoginResult = {
			isSuccess: false,
			isNewUser: false,
			email: '',
		};

		if (oauthType === 'kakao') loginResult = await kakaoLogin();
		else if (oauthType === 'naver') loginResult = await naverLogin();
		else if (oauthType === 'apple') loginResult = await appleLogin();

		if (loginResult.isSuccess) {
			// 신규 유저
			if (loginResult.isNewUser) {
				navigateToAgreeToTermsAndConditions({
					uid: auth.currentUser?.uid!,
					oauthType,
					email: loginResult.email ?? '',
				});

				return;
			} else {
				// 기존 유저
				showToast('success', '로그인 성공');
				replaceToMyProfile();
			}
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.titleContainer}>
					<FastImage
						source={require('../assets/images/landing.webp')}
						style={{ width: 300, height: 300 }}
						resizeMode='contain'
					/>
				</View>
			</View>
			<View style={styles.body}>
				{/* <SocialLoginButton
					oauthType='kakao'
					onPress={() => handleLogin('kakao')}
					style={{ width: '95%' }}
					// disabled
				/> */}
				<SocialLoginButton
					oauthType='naver'
					onPress={() => handleLogin('naver')}
					style={{ width: '95%' }}
				/>
				<SocialLoginButton
					oauthType='apple'
					onPress={() => handleLogin('apple')}
					style={{ width: '95%', borderWidth: 1 }}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: PADDING,
		backgroundColor: 'white',
	},
	header: {
		flex: 1,
		width: '100%',
		paddingTop: '20%',
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
	},
	title: {
		fontWeight: 'bold',
		fontSize: 24,
	},
	body: {
		width: '100%',
		alignItems: 'center',
		gap: 12,
	},
});

export default Login;

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Leaf from '@/components/ui/Icons/Leaf';
import { PADDING } from '@/components/ui/layout/Layout';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/AuthStore';
import { OauthType } from '@/types/user';
import { replaceToMyProfile } from '@/utilities/navigationHelpers';
import FastImage from 'react-native-fast-image';

const Login = () => {
	const kakaoLogin = useAuthStore((state) => state.kakaoLogin);
	const naverLogin = useAuthStore((state) => state.naverLogin);

	const handleLogin = async (oauthType: OauthType) => {
		let isSuccess: boolean | void = false;

		if (oauthType === 'kakao') isSuccess = await kakaoLogin();
		else if (oauthType === 'naver') isSuccess = await naverLogin();

		if (Boolean(isSuccess)) {
			showToast('success', '로그인 성공');
			replaceToMyProfile();
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.titleContainer}>
					<Text style={styles.title}>모동숲 마켓</Text>
					<Leaf style={styles.logoImage} />
				</View>
			</View>
			<View style={styles.body}>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => handleLogin('naver')}
					style={styles.buttonContainer}
				>
					<FastImage
						source={require('../assets/images/naver_login.png')}
						style={styles.kakaoLoginImage}
						resizeMode={FastImage.resizeMode.contain}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => handleLogin('kakao')}
					style={styles.buttonContainer}
				>
					<FastImage
						source={require('../assets/images/kakao_login.png')}
						style={styles.kakaoLoginImage}
						resizeMode={FastImage.resizeMode.contain}
					/>
				</TouchableOpacity>
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
	},
	title: {
		fontWeight: 'bold',
		fontSize: 24,
	},
	logoImage: {
		width: 40,
		height: 40,
	},
	body: {
		width: '100%',
		alignItems: 'center',
	},
	buttonContainer: {
		width: '90%',
	},
	kakaoLoginImage: {
		width: '100%',
		height: 60,
		resizeMode: 'contain',
	},
});

export default Login;

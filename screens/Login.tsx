import type { TabNavigation } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Layout from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { OauthType } from '@/types/user';

const Login = () => {
	const { kakaoLogin, naverLogin } = useAuthContext();
	const tabNavigation = useNavigation<TabNavigation>();

	const handleLogin = async (oauthType: OauthType) => {
		let isSuccess: boolean | void = false;

		if (oauthType === 'kakao') isSuccess = await kakaoLogin();
		else if (oauthType === 'naver') isSuccess = await naverLogin();

		if (Boolean(isSuccess)) {
			showToast('success', '로그인 성공');
			tabNavigation.reset({
				index: 0,
				routes: [{ name: 'HomeTab' }],
			});
		}
	};

	return (
		<Layout>
			<View style={styles.container}>
				<View style={styles.header}>
					<View style={styles.titleContainer}>
						<Text style={styles.title}>모동숲 마켓</Text>
						<Image
							source={require('../assets/images/logo.png')}
							style={styles.logoImage}
						/>
					</View>
				</View>
				<View style={styles.body}>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => handleLogin('naver')}
						style={styles.buttonContainer}
					>
						<Image
							source={require('../assets/images/naver_login.png')}
							style={styles.kakaoLoginImage}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => handleLogin('kakao')}
						style={styles.buttonContainer}
					>
						<Image
							source={require('../assets/images/kakao_login.png')}
							style={styles.kakaoLoginImage}
						/>
					</TouchableOpacity>
				</View>
			</View>
		</Layout>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
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
		resizeMode: 'contain',
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

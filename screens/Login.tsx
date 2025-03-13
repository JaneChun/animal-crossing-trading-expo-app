import type { TabNavigation } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Layout from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { useAuthContext } from '@/contexts/AuthContext';

const Login = () => {
	const { login } = useAuthContext();
	const tabNavigation = useNavigation<TabNavigation>();

	const handleLogin = async () => {
		const isSuccess: boolean | void = await login();

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
					<Text style={styles.title}>모동숲 마켓</Text>
				</View>
				<View style={styles.body}>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={handleLogin}
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
		paddingTop: '30%',
		alignItems: 'center',
	},
	title: {
		fontWeight: 600,
		fontSize: 24,
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
		resizeMode: 'contain',
	},
});

export default Login;

import type { TabNavigation } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

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
				<TouchableOpacity activeOpacity={0.7} onPress={handleLogin}>
					<Image
						source={require('../assets/images/kakao_login.png')}
						style={styles.kakaoLoginImage}
					/>
				</TouchableOpacity>
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
	kakaoLoginImage: {},
});

export default Login;

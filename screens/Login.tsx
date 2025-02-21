import type { TabNavigation } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import Layout from '@/components/ui/Layout';
import { useAuthContext } from '@/contexts/AuthContext';

const Login = () => {
	const { login } = useAuthContext();
	const navigation = useNavigation<TabNavigation>();

	const handleLogin = async () => {
		const isSuccess: boolean | void = await login();

		if (Boolean(isSuccess)) {
			navigation.reset({
				index: 0,
				routes: [{ name: 'Home' }],
			});
		} else {
			Alert.alert('로그인 실패', '다시 시도해주세요.');
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

import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabNavigation } from '@/types/navigation';

import { useAuthContext } from '@/contexts/AuthContext';

const Login = () => {
	const { userInfo, login } = useAuthContext();
	const navigation = useNavigation<TabNavigation>();

	const handleLogin = () => {
		login();
		navigation.navigate('Home');
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity activeOpacity={0.7} onPress={handleLogin}>
				<Image
					source={require('../assets/images/kakao_login.png')}
					style={styles.kakaoLoginImage}
				/>
			</TouchableOpacity>
		</View>
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

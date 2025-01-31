import { useAuthContext } from '@/contexts/AuthContext';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabNavigation } from '@/types/navigation';

const MyPage = () => {
	const { logout } = useAuthContext();
	const navigation = useNavigation<TabNavigation>();

	const handleLogout = () => {
		logout();
		navigation.navigate('Home');
	};

	return (
		<View>
			<Text>MyPage</Text>
			<Button title='로그아웃' onPress={handleLogout} />
		</View>
	);
};

export default MyPage;

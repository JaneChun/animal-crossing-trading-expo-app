import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { TabNavigation } from '@/types/navigation';
import { ScrollView, StyleSheet, View } from 'react-native';
import Profile from '@/components/MyPage/Profile';
import { Colors } from '@/constants/Color';
import MyPosts from '@/components/MyPage/MyPosts';

const MyPage = () => {
	const navigation = useNavigation<TabNavigation>();
	const { userInfo } = useAuthContext();

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{userInfo && (
				<View style={styles.profileCard}>
					<View style={styles.profileContent}>
						<Profile />
					</View>
				</View>
			)}
			<MyPosts />
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 24,
		backgroundColor: 'white',
	},
	profileCard: {
		width: '100%',
		maxWidth: 350,
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: Colors.border_gray,
		elevation: 5,
		shadowColor: Colors.border_gray,
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowOpacity: 1,
		shadowRadius: 2,
	},
	profileContent: { alignItems: 'center', marginBottom: 20 },
});

export default MyPage;

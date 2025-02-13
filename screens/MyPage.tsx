import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { TabNavigation } from '@/types/navigation';
import { ScrollView, StyleSheet, View } from 'react-native';
import Profile from '@/components/MyPage/Profile';
// import MyPosts from '../Components/MyPosts';

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
			{/* {!isEditing && <MyPosts />} */}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: { flexGrow: 1, alignItems: 'center', padding: 20 },
	error: { color: 'red', marginBottom: 10 },
	profileCard: {
		width: '100%',
		maxWidth: 350,
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
		elevation: 5,
	},
	profileContent: { alignItems: 'center', marginBottom: 20 },
});

export default MyPage;

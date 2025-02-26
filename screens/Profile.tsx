import MyPosts from '@/components/Profile/MyPosts';
import ProfileBox from '@/components/Profile/Profile';
import Layout from '@/components/ui/Layout';
import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import useLoading from '@/hooks/useLoading';
import { ProfileStackNavigation } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Profile = () => {
	const { userInfo } = useAuthContext();
	const { LoadingIndicator } = useLoading();
	const stackNavigation = useNavigation<ProfileStackNavigation>();

	if (!userInfo) {
		return <LoadingIndicator />;
	}

	const onPressSetting = () => {
		stackNavigation.navigate('Setting');
	};

	return (
		<Layout>
			<View style={styles.header}>
				<Text style={styles.title}>프로필</Text>
				<TouchableOpacity style={styles.iconContainer} onPress={onPressSetting}>
					<Ionicons
						name='settings-outline'
						color={Colors.font_gray}
						size={24}
					/>
				</TouchableOpacity>
			</View>

			<FlatList
				data={[]}
				renderItem={null}
				ListHeaderComponent={<ProfileBox />}
				ListEmptyComponent={<MyPosts />}
			/>
		</Layout>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		color: Colors.font_black,
	},
	iconContainer: {
		padding: 5,
	},
});

export default Profile;

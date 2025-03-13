import MyPosts from '@/components/Profile/MyPosts';
import ProfileBox from '@/components/Profile/Profile';
import Layout from '@/components/ui/Layout';
import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import useGetPosts from '@/hooks/useGetPosts';
import useLoading from '@/hooks/useLoading';
import { useNavigationStore } from '@/store/store';
import { Tab } from '@/types/components';
import { ProfileStackNavigation } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Profile = () => {
	const { userInfo } = useAuthContext();
	const stackNavigation = useNavigation<ProfileStackNavigation>();
	const { LoadingIndicator } = useLoading();
	const {
		data,
		isLoading: isFetching,
		isEnd,
		loadMore,
	} = useGetPosts('Boards', { creatorId: userInfo?.uid }, 5);
	const { setActiveTab } = useNavigationStore();
	const currentTab = useCurrentTab();

	const isFocused = useIsFocused();

	useFocusEffect(
		useCallback(() => {
			if (isFocused) setActiveTab(currentTab as Tab);
		}, [isFocused]),
	);

	if (!userInfo || (isFetching && data.length === 0)) {
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
				ListEmptyComponent={
					<MyPosts
						data={data}
						isLoading={isFetching}
						isEnd={isEnd}
						loadMore={loadMore}
					/>
				}
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

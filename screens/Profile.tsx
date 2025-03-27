import MyPosts from '@/components/Profile/MyPosts';
import ProfileBox from '@/components/Profile/Profile';
import Layout from '@/components/ui/Layout';
import { Colors } from '@/constants/Color';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import useLoading from '@/hooks/useLoading';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { Tab } from '@/types/components';
import { ProfileStackNavigation } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Profile = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const stackNavigation = useNavigation<ProfileStackNavigation>();
	const {
		isLoading: isUploading,
		setIsLoading: setIsUploading,
		LoadingIndicator,
	} = useLoading();
	const setActiveTab = useActiveTabStore((state) => state.setActiveTab);
	const currentTab = useCurrentTab();

	const isFocused = useIsFocused();

	useFocusEffect(
		useCallback(() => {
			if (isFocused) setActiveTab(currentTab as Tab);
		}, [isFocused]),
	);

	if (!userInfo || isUploading) {
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
				ListHeaderComponent={
					<ProfileBox
						isUploading={isUploading}
						setIsUploading={setIsUploading}
					/>
				}
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

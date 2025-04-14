import MyPosts from '@/components/Profile/MyPosts';
import ProfileBox from '@/components/Profile/Profile';
import Layout, { PADDING } from '@/components/ui/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { Colors } from '@/constants/Color';
import useLoading from '@/hooks/shared/useLoading';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { Tab } from '@/types/components';
import { ProfileStackNavigation } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import {
	useFocusEffect,
	useIsFocused,
	useNavigation,
} from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Profile = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const stackNavigation = useNavigation<ProfileStackNavigation>();
	const { isLoading: isUploading, setIsLoading: setIsUploading } = useLoading();
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
		<Layout
			title='프로필'
			titleRightComponent={
				<TouchableOpacity style={styles.iconContainer} onPress={onPressSetting}>
					<Ionicons
						name='settings-outline'
						color={Colors.font_gray}
						size={24}
					/>
				</TouchableOpacity>
			}
		>
			<FlatList
				data={[]}
				renderItem={null}
				ListHeaderComponent={
					<View style={{ paddingHorizontal: PADDING }}>
						<ProfileBox
							isUploading={isUploading}
							setIsUploading={setIsUploading}
						/>
					</View>
				}
				ListEmptyComponent={<MyPosts />}
			/>
		</Layout>
	);
};

const styles = StyleSheet.create({
	iconContainer: { paddingRight: 5 },
});

export default Profile;

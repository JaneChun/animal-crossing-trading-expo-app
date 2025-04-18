import MyPosts from '@/components/Profile/MyPosts';
import ProfileBox from '@/components/Profile/Profile';
import Layout, { PADDING } from '@/components/ui/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { Colors } from '@/constants/Color';
import { getPublicUserInfo } from '@/firebase/services/userService';
import useLoading from '@/hooks/shared/useLoading';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { ProfileRouteProp } from '@/types/navigation';
import { Tab } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { navigateToSetting } from '@/utilities/navigationHelpers';
import { Ionicons } from '@expo/vector-icons';
import {
	useFocusEffect,
	useIsFocused,
	useRoute,
} from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Profile = () => {
	const route = useRoute<ProfileRouteProp>();
	const { userId: targetUserId } = route?.params ?? {};
	const userInfo = useAuthStore((state) => state.userInfo);
	const { isLoading: isUploading, setIsLoading: setIsUploading } = useLoading();
	const setActiveTab = useActiveTabStore((state) => state.setActiveTab);
	const currentTab = useCurrentTab();

	const [profileInfo, setProfileInfo] = useState<PublicUserInfo | null>(null);
	const isMyProfile: boolean =
		(userInfo && userInfo.uid === profileInfo?.uid) ?? false;

	const isFocused = useIsFocused();

	useFocusEffect(
		useCallback(() => {
			if (isFocused) setActiveTab(currentTab as Tab);
		}, [isFocused]),
	);

	useEffect(() => {
		const getTargetUserInfo = async () => {
			if (targetUserId) {
				const targetUserInfo = await getPublicUserInfo(targetUserId);
				setProfileInfo(targetUserInfo);
			} else {
				setProfileInfo(userInfo);
			}
		};

		getTargetUserInfo();
	}, [targetUserId, userInfo]);

	if (!profileInfo || isUploading) {
		return <LoadingIndicator />;
	}

	return (
		<Layout
			title='프로필'
			titleRightComponent={
				isMyProfile && (
					<TouchableOpacity
						style={styles.iconContainer}
						onPress={navigateToSetting}
					>
						<Ionicons
							name='settings-outline'
							color={Colors.font_gray}
							size={24}
						/>
					</TouchableOpacity>
				)
			}
		>
			<FlatList
				data={[]}
				renderItem={null}
				ListHeaderComponent={
					<View style={{ paddingHorizontal: PADDING }}>
						<ProfileBox
							profileInfo={profileInfo}
							isMyProfile={isMyProfile}
							isUploading={isUploading}
							setIsUploading={setIsUploading}
						/>
					</View>
				}
				ListEmptyComponent={<MyPosts profileInfo={profileInfo} />}
			/>
		</Layout>
	);
};

const styles = StyleSheet.create({
	iconContainer: { paddingRight: 5 },
});

export default Profile;

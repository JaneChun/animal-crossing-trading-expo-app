import EditProfileModal from '@/components/Profile/EditProfileModal';
import MyPosts from '@/components/Profile/MyPosts';
import ProfileBox from '@/components/Profile/Profile';
import SettingIcon from '@/components/Profile/SettingIcon';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { getPublicUserInfo } from '@/firebase/services/userService';
import useLoading from '@/hooks/shared/useLoading';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { ProfileRouteProp } from '@/types/navigation';
import { Tab } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import {
	useFocusEffect,
	useIsFocused,
	useRoute,
} from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Profile = () => {
	const route = useRoute<ProfileRouteProp>();
	const { userId: targetUserId } = route?.params ?? {};
	const userInfo = useAuthStore((state) => state.userInfo);
	const { isLoading: isUploading, setIsLoading: setIsUploading } = useLoading();
	const setActiveTab = useActiveTabStore((state) => state.setActiveTab);
	const currentTab = useCurrentTab();
	const [profileInfo, setProfileInfo] = useState<PublicUserInfo | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const isFocused = useIsFocused();

	const isMyProfile: boolean =
		(userInfo && userInfo.uid === profileInfo?.uid) ?? false;

	useFocusEffect(
		useCallback(() => {
			if (isFocused) setActiveTab(currentTab as Tab);
		}, [isFocused, setActiveTab, currentTab]),
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

	const openEditProfileModal = () => setIsModalVisible(true);
	const closeEditProfileModal = () => {
		Keyboard.dismiss();
		setIsModalVisible(false);
	};

	if (!profileInfo || isUploading) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<Layout title='프로필' headerRightComponent={isMyProfile && SettingIcon}>
				<FlatList
					data={[]}
					renderItem={null}
					ListHeaderComponent={
						<View style={{ paddingHorizontal: PADDING }}>
							<ProfileBox
								profileInfo={profileInfo}
								isMyProfile={isMyProfile}
								openEditProfileModal={openEditProfileModal}
							/>
						</View>
					}
					ListEmptyComponent={<MyPosts profileInfo={profileInfo} />}
				/>
			</Layout>

			{isMyProfile && (
				<EditProfileModal
					isVisible={isModalVisible}
					onClose={closeEditProfileModal}
					isUploading={isUploading}
					setIsUploading={setIsUploading}
				/>
			)}
		</>
	);
};

export default Profile;

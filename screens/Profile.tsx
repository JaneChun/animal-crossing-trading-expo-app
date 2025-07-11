import ReportModal from '@/components/PostDetail/ReportModal';
import EditProfileModal from '@/components/Profile/EditProfileModal';
import MyPosts from '@/components/Profile/MyPosts';
import ProfileBox from '@/components/Profile/Profile';
import SettingIcon from '@/components/Profile/SettingIcon';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { Colors } from '@/constants/Color';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { useBlockUser } from '@/hooks/shared/useBlockUser';
import { useCurrentTab } from '@/hooks/shared/useCurrentTab';
import useLoading from '@/hooks/shared/useLoading';
import { useReportUser } from '@/hooks/shared/useReportUser';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useUserInfo } from '@/stores/auth';
import { ProfileRouteProp, RootStackNavigation } from '@/types/navigation';
import { Tab } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import {
	useFocusEffect,
	useIsFocused,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Image, Keyboard, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Profile = () => {
	const route = useRoute<ProfileRouteProp>();
	const { userId: targetUserId } = route?.params ?? {};

	const setActiveTab = useActiveTabStore((state) => state.setActiveTab);
	const stackNavigation = useNavigation<RootStackNavigation>();

	const currentTab = useCurrentTab();
	const isFocused = useIsFocused();
	const userInfo = useUserInfo();

	const [profileInfo, setProfileInfo] = useState<PublicUserInfo | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isViewerOpen, setIsViewerOpen] = useState(false);

	// 신고
	const {
		isReportModalVisible,
		openReportModal,
		closeReportModal,
		submitReport,
	} = useReportUser();

	// 차단
	const { isBlockedByMe, toggleBlock: onToggleBlock } = useBlockUser({
		targetUserId: profileInfo?.uid,
		targetUserDisplayName: profileInfo?.displayName,
	});

	const { isLoading: isUploading, setIsLoading: setIsUploading } = useLoading();

	const isMyProfile: boolean =
		(userInfo && userInfo.uid === profileInfo?.uid) ?? false;

	const emptyProfileImageSource = require('../assets/images/empty_profile_image.png');
	const resolvedEmptyProfileImage = Image.resolveAssetSource(
		emptyProfileImageSource,
	);

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

	useEffect(() => {
		stackNavigation.setOptions({
			headerRight: () =>
				userInfo &&
				profileInfo && (
					<ActionSheetButton
						color={Colors.font_black}
						size={18}
						cancelIndex={2}
						options={[
							{
								label: isBlockedByMe ? '차단 해제' : '차단',
								onPress: onToggleBlock,
							},
							{
								label: '신고',
								onPress: () => {
									openReportModal({
										reporteeId: profileInfo.uid,
									});
								},
							},
							{ label: '취소', onPress: () => {} },
						]}
					/>
				),
		});
	}, [stackNavigation, profileInfo, isBlockedByMe, userInfo]);

	const openEditProfileModal = () => setIsModalVisible(true);
	const closeEditProfileModal = () => {
		Keyboard.dismiss();
		setIsModalVisible(false);
	};

	const openImageViewerModal = () => {
		setIsViewerOpen(true);
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
								openImageViewerModal={openImageViewerModal}
							/>
						</View>
					}
					ListEmptyComponent={
						<MyPosts isMyProfile={isMyProfile} profileInfo={profileInfo} />
					}
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

			{isReportModalVisible && (
				<ReportModal
					isVisible={isReportModalVisible}
					onClose={closeReportModal}
					onSubmit={submitReport}
				/>
			)}

			<ImageViewerModal
				visible={isViewerOpen}
				images={
					profileInfo?.photoURL
						? [profileInfo?.photoURL]
						: [resolvedEmptyProfileImage.uri]
				}
				initialIndex={0}
				onRequestClose={() => setIsViewerOpen(false)}
			/>
		</>
	);
};

export default Profile;

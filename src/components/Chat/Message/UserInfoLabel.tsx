import { Pressable, StyleSheet } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { PublicUserInfo } from '@/types/user';
import { navigateToUserProfile } from '@/utilities/navigationHelpers';
import EmptyProfileImage from '@assets/images/empty_profile_image.png';

const UserInfoLabel = ({ userInfo }: { userInfo: PublicUserInfo }) => {
	const onPressUserProfile = () => {
		if (userInfo?.displayName === DEFAULT_USER_DISPLAY_NAME) return;

		navigateToUserProfile({ userId: userInfo?.uid });
	};

	return (
		<Pressable style={styles.header} onPress={onPressUserProfile}>
			<ImageWithFallback
				uri={userInfo?.photoURL}
				fallbackSource={EmptyProfileImage}
				style={styles.profileImage}
			/>

			<Text variant="body1" weight="semibold">
				{userInfo?.displayName}
			</Text>
		</Pressable>
	);
};

export default UserInfoLabel;

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	profileImage: {
		width: 28,
		height: 28,
		borderRadius: 20,
		marginLeft: 4,
		marginRight: 8,
	},
});

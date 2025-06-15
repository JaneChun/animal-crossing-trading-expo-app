import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { FontWeights } from '@/constants/Typography';
import { PublicUserInfo } from '@/types/user';
import { navigateToUserProfile } from '@/utilities/navigationHelpers';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const UserInfoLabel = ({ userInfo }: { userInfo: PublicUserInfo }) => {
	const onPressUserProfile = () => {
		if (userInfo?.displayName === DEFAULT_USER_DISPLAY_NAME) return;

		navigateToUserProfile({ userId: userInfo?.uid });
	};

	return (
		<Pressable style={styles.header} onPress={onPressUserProfile}>
			<ImageWithFallback
				uri={userInfo?.photoURL}
				fallbackSource={require('../../../assets/images/empty_profile_image.png')}
				style={styles.profileImage}
			/>

			<Text style={styles.displayName}>{userInfo?.displayName}</Text>
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
	displayName: {
		fontSize: 16,
		fontWeight: FontWeights.semibold,
	},
});

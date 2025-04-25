import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { FontWeights } from '@/constants/Typography';
import { PublicUserInfo } from '@/types/user';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const UserInfoLabel = ({ userInfo }: { userInfo: PublicUserInfo }) => {
	return (
		<View style={styles.header}>
			<ImageWithFallback
				uri={userInfo?.photoURL}
				fallbackSource={require('../../../assets/images/empty_profile_image.png')}
				style={styles.profileImage}
			/>

			<Text style={styles.displayName}>{userInfo?.displayName}</Text>
		</View>
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

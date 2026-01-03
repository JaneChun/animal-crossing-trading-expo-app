import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { blockUser, unblockUser } from '@/firebase/services/blockService';
import { useUserInfo } from '@/stores/auth';
import { BlockedUser } from '@/types/user';
import { navigateToUserProfile } from '@/utilities/navigationHelpers';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

type BlockedUserUnitProps = {
	blockedUserInfo: BlockedUser;
	onToggleBlock: (uid: string, newBlockedState: boolean) => void;
};

const BlockedUserUnit = ({
	blockedUserInfo,
	onToggleBlock,
}: BlockedUserUnitProps) => {
	const userInfo = useUserInfo();
	const { uid, displayName, islandName, photoURL, isBlocked } = blockedUserInfo;

	const handlePress = async () => {
		if (!userInfo) return;

		if (isBlocked) {
			// 차단 해제
			await unblockUser({ userId: userInfo.uid, targetUserId: uid });
			onToggleBlock(uid, false);
		} else {
			// 다시 차단
			await blockUser({ userId: userInfo.uid, targetUserId: uid });
			onToggleBlock(uid, true);
		}
	};

	const onPressUserProfile = () => {
		if (displayName === DEFAULT_USER_DISPLAY_NAME) return;

		navigateToUserProfile({ userId: uid });
	};

	return (
		<Pressable style={styles.container} onPress={onPressUserProfile}>
			<View style={styles.header}>
				<ImageWithFallback
					uri={blockedUserInfo?.photoURL}
					fallbackSource={require('../../../assets/images/empty_profile_image.png')}
					style={styles.profileImage}
				/>
			</View>
			<View style={styles.body}>
				<View>
					<Text style={styles.displayName}>{displayName}</Text>
					<Text style={styles.islandName}>{islandName}</Text>
				</View>
			</View>
			<View style={styles.footer}>
				<Button
					size='md2'
					color={isBlocked ? 'red' : 'redWhite'}
					style={{ width: 90 }}
					onPress={handlePress}
				>
					{isBlocked ? '차단중' : '차단하기'}
				</Button>
			</View>
		</Pressable>
	);
};

export default BlockedUserUnit;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	header: {},
	body: {
		flexGrow: 1,
		marginLeft: 12,
		justifyContent: 'center',
	},
	footer: {},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
	},
	displayName: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
	},
	islandName: {
		flex: 1,
		marginTop: 4,
		fontSize: FontSizes.sm,
		color: Colors.font_gray,
		fontWeight: FontWeights.light,
	},
});

import { Pressable, StyleSheet, View } from 'react-native';

import Button from '@/components/ui/Button';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { blockUser, unblockUser } from '@/firebase/services/blockService';
import { useUserInfo } from '@/stores/auth';
import { Theme, useThemedStyles } from '@/theme';
import { BlockedUser } from '@/types/user';
import { navigateToUserProfile } from '@/utilities/navigationHelpers';
import emptyProfileImage from '@assets/images/empty_profile_image.png';

type BlockedUserUnitProps = {
	blockedUserInfo: BlockedUser;
	onToggleBlock: (uid: string, newBlockedState: boolean) => void;
};

const BlockedUserUnit = ({ blockedUserInfo, onToggleBlock }: BlockedUserUnitProps) => {
	const styles = useThemedStyles(makeStyles);
	const userInfo = useUserInfo();
	const { uid, displayName, islandName, isBlocked } = blockedUserInfo;

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
					fallbackSource={emptyProfileImage}
					style={styles.profileImage}
				/>
			</View>
			<View style={styles.body}>
				<View>
					<Text variant="body1" weight="semibold">
						{displayName}
					</Text>
					<Text variant="body2" weight="light" color="tertiary" style={styles.islandName}>
						{islandName}
					</Text>
				</View>
			</View>
			<View style={styles.footer}>
				<Button
					size="md"
					variant={isBlocked ? 'danger' : 'dangerOutline'}
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

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border.default,
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
	islandName: {
		flex: 1,
		marginTop: 4,
	},
});

import { Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { UserInfoProps } from '@/types/components';
import { navigateToUserProfile } from '@/utilities/navigationHelpers';

import Island from '../ui/Icons/Island';

const UserInfo = ({ userId, displayName, islandName, containerStyle }: UserInfoProps) => {
	const onPressUserProfile = () => {
		if (displayName === DEFAULT_USER_DISPLAY_NAME) return;

		navigateToUserProfile({ userId });
	};

	return (
		<View style={[styles.container, containerStyle]}>
			<Pressable onPress={onPressUserProfile}>
				<Text variant="body2" color="tertiary">
					{displayName}
				</Text>
			</Pressable>
			<View style={styles.IslandContainer}>
				<Island style={styles.logoImage} />
				<Text variant="body2" color="tertiary" style={styles.islandName}>
					{islandName}
				</Text>
			</View>
		</View>
	);
};

export default UserInfo;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	IslandContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	logoImage: {
		width: 20,
		height: 20,
		marginLeft: 8,
	},
	islandName: {
		marginLeft: 1,
	},
});

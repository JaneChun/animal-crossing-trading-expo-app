import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
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
				<Text style={styles.displayName}>{displayName}</Text>
			</Pressable>
			<View style={styles.IslandContainer}>
				<Island style={styles.logoImage} />
				<Text style={styles.islandName}>{islandName}</Text>
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
	displayName: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.regular,
		color: Colors.text.tertiary,
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
		color: Colors.text.tertiary,
		fontWeight: FontWeights.regular,
		marginLeft: 1,
	},
});

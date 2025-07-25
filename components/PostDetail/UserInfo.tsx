import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { UserInfoProps } from '@/types/components';
import { navigateToUserProfile } from '@/utilities/navigationHelpers';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Leaf from '../ui/Icons/Leaf';

const UserInfo = ({
	userId,
	displayName,
	islandName,
	containerStyle,
}: UserInfoProps) => {
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
				<Leaf style={styles.logoImage} />
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
		color: Colors.font_gray,
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
		color: Colors.font_gray,
		fontWeight: FontWeights.regular,
		marginLeft: 1,
	},
});

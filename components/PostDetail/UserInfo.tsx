import { Colors } from '@/constants/Color';
import { UserInfoProps } from '@/types/components';
import { Image, StyleSheet, Text, View } from 'react-native';

const UserInfo = ({
	displayName,
	islandName,
	containerStyle,
}: UserInfoProps) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.displayName}>{displayName}</Text>
			<View style={styles.IslandContainer}>
				<Image
					source={require('../../assets/images/island_icon.png')}
					style={styles.islandImage}
				/>
				{islandName && <Text style={styles.islandName}>{islandName}</Text>}
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
		fontSize: 16,
		fontWeight: 600,
		color: Colors.font_gray,
	},
	IslandContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	islandImage: {
		width: 20,
		height: 20,
		marginLeft: 8,
	},
	islandName: {
		color: Colors.font_gray,
		marginLeft: 1,
	},
});

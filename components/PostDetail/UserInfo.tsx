import { Colors } from '@/constants/Color';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';

type UserInfoProps = {
	displayName: string;
	islandName: string;
	containerStyle: ViewStyle;
};

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
					source={{
						uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FCoconut_Tree_NH_Inv_Icon.png?alt=media&token=cd997010-694e-49b0-9390-483772cdad8a',
					}}
					style={styles.islandImage}
				/>
				<Text style={styles.islandName}>{islandName || '지지섬'}</Text>
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

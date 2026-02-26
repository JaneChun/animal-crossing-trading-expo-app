import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/theme/Color';
import { AddImageButtonProps } from '@/types/components';

const AddImageButton = ({ count, totalCount, onPress, isLoading }: AddImageButtonProps) => {
	return (
		<TouchableOpacity
			style={[styles.addImageButtonContainer, styles.imageContainer]}
			activeOpacity={0.5}
			onPress={onPress}
			disabled={isLoading}
		>
			{isLoading ? (
				<>
					<ActivityIndicator color={Colors.text.tertiary} size="large" />
					<View style={styles.textContainer}>
						<Text style={styles.totalCountText}>업로드중...</Text>
					</View>
				</>
			) : (
				<>
					<MaterialIcons name="photo-library" color={Colors.text.tertiary} size={48} />
					<View style={styles.textContainer}>
						<Text style={styles.currentCountText}>{count}</Text>
						<Text style={styles.totalCountText}> / {totalCount}</Text>
					</View>
				</>
			)}
		</TouchableOpacity>
	);
};

export default AddImageButton;

const styles = StyleSheet.create({
	imageContainer: {
		width: 100,
		height: 100,
		margin: 6,
		borderRadius: 12,
	},
	addImageButtonContainer: {
		padding: 8,
		backgroundColor: Colors.bg.secondary,
		borderWidth: 1,
		borderColor: Colors.border.default,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textContainer: {
		fontSize: 14,
		flexDirection: 'row',
		marginTop: 4,
	},
	currentCountText: {
		color: Colors.brand.primary,
		fontWeight: 'bold',
	},
	totalCountText: {
		color: Colors.text.tertiary,
		fontWeight: 'semibold',
	},
});

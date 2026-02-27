import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';

const PostNotExist = () => {
	return (
		<View style={styles.container}>
			<Feather name="alert-circle" color={Colors.text.tertiary} size={16} />
			<Text style={styles.invalidPostText}>게시글을 찾을 수 없습니다.</Text>
		</View>
	);
};

export default PostNotExist;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16,
		height: 70,
		borderColor: Colors.border.default,
		borderWidth: 1,
		backgroundColor: Colors.bg.primary,
		borderRadius: 8,
		gap: 6,
	},
	invalidPostText: {
		color: Colors.text.tertiary,
		alignSelf: 'center',
		fontWeight: FontWeights.regular,
		fontSize: FontSizes.sm,
	},
});

import { StyleSheet, View } from 'react-native';

import ThreeDotsLoadingIndicator from '@/components/ui/loading/ThreeDotsLoadingIndicator';
import { Colors } from '@/theme/Color';

const PostSummaryLoading = () => {
	return (
		<View style={styles.container}>
			<ThreeDotsLoadingIndicator />
		</View>
	);
};

export default PostSummaryLoading;

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
	},
});

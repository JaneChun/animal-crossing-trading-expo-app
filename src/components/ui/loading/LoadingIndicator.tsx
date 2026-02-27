import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Colors } from '@/theme/Color';
import dotSpinnerImage from 'assets/images/dots-spinner.jpg';

const LoadingIndicator = () => (
	<View style={styles.loadingContainer}>
		<FastImage source={dotSpinnerImage} style={{ height: 150, width: 150 }} />
	</View>
);

export default LoadingIndicator;

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.bg.primary,
	},
});

import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Colors } from '@/theme/Color';
import spinnerImage from '@assets/images/spinner.gif';

const InlineLoadingIndicator = () => (
	<View style={styles.inlineLoadingContainer}>
		<FastImage source={spinnerImage} style={{ height: 100, width: 100 }} />
	</View>
);

export default InlineLoadingIndicator;

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.bg.primary,
	},
	inlineLoadingContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});

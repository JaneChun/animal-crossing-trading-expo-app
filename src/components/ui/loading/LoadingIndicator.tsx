import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

const LoadingIndicator = () => (
	<View style={styles.loadingContainer}>
		<FastImage
			source={require('../../../../assets/images/dots-spinner.jpg')}
			style={{ height: 150, width: 150 }}
		/>
	</View>
);

export default LoadingIndicator;

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
});

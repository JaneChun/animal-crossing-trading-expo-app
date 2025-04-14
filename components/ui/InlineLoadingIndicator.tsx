import { Image, StyleSheet, View } from 'react-native';

const InlineLoadingIndicator = () => (
	<View style={styles.inlineLoadingContainer}>
		<Image
			source={require('../../assets/images/spinner.gif')}
			style={{ height: 100, width: 100 }}
		/>
	</View>
);

export default InlineLoadingIndicator;

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	inlineLoadingContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});

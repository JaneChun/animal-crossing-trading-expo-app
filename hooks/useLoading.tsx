import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const useLoading = () => {
	const [isLoading, setIsLoading] = useState(false);

	const LoadingIndicator = () => (
		<View style={styles.loadingContainer}>
			<Image
				source={require('../assets/images/spinner.gif')}
				style={{ height: 150, width: 150 }}
			/>
		</View>
	);

	const InlineLoadingIndicator = () => (
		<View style={styles.inlineLoadingContainer}>
			<Image
				source={require('../assets/images/spinner.gif')}
				style={{ height: 100, width: 100 }}
			/>
		</View>
	);

	return { isLoading, setIsLoading, LoadingIndicator, InlineLoadingIndicator };
};

export default useLoading;

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

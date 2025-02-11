import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Colors } from '@/constants/Color';

const useLoading = () => {
	const [isLoading, setIsLoading] = useState(false);

	const LoadingIndicator = () => (
		<View style={styles.loadingContainer}>
			<Image
				source={require('../assets/images/spinner.gif')}
				style={{ height: 150, width: 150 }}
			/>
			{/* <ActivityIndicator size='large' color={Colors.primary} /> */}
		</View>
	);

	return { isLoading, setIsLoading, LoadingIndicator };
};

export default useLoading;

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
});

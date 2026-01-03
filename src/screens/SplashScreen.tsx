import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

const SplashScreen = () => {
	return (
		<View style={styles.container}>
			<FastImage
				source={require('../../assets/images/splash_image.jpg')}
				style={styles.image}
				resizeMode='contain'
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: '100%',
		height: '100%',
	},
});

export default SplashScreen;
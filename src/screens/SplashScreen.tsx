import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Colors } from '@/theme/Color';
import splashImage from '@assets/images/splash_image.jpg';

const SplashScreen = () => {
	return (
		<View style={styles.container}>
			<FastImage source={splashImage} style={styles.image} resizeMode="contain" />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.bg.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: '100%',
		height: '100%',
	},
});

export default SplashScreen;

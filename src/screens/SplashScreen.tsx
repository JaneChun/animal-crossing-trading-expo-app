import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Theme, useThemedStyles } from '@/theme';
import splashImage from '@assets/images/splash_image.jpg';

const SplashScreen = () => {
	const styles = useThemedStyles(makeStyles);
	return (
		<View style={styles.container}>
			<FastImage source={splashImage} style={styles.image} resizeMode="contain" />
		</View>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.bg.primary,
			justifyContent: 'center',
			alignItems: 'center',
		},
		image: {
			width: '100%',
			height: '100%',
		},
	});

export default SplashScreen;

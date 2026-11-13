import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Theme, useThemedStyles } from '@/theme';
import splashIcon from '@assets/images/splash_icon.png';

/** app.config.js의 expo-splash-screen `imageWidth`와 같아야 네이티브 스플래시에서 넘어올 때 로고가 움직이지 않는다 */
const SPLASH_ICON_WIDTH = 150;
/** splash_icon.png 원본 크기(797x632)의 가로세로 비율 */
const SPLASH_ICON_ASPECT_RATIO = 797 / 632;

const SplashScreen = () => {
	const styles = useThemedStyles(makeStyles);
	return (
		<View style={styles.container}>
			<FastImage source={splashIcon} style={styles.image} resizeMode="contain" />
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
			width: SPLASH_ICON_WIDTH,
			aspectRatio: SPLASH_ICON_ASPECT_RATIO,
		},
	});

export default SplashScreen;

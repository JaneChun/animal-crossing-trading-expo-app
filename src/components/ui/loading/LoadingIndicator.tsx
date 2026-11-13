import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Theme, useThemedStyles } from '@/theme';
import dotSpinnerImage from '@assets/images/dots-spinner.jpg';

const LoadingIndicator = () => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.loadingContainer}>
			<FastImage source={dotSpinnerImage} style={{ height: 150, width: 150 }} />
		</View>
	);
};

export default LoadingIndicator;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		loadingContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: colors.bg.primary,
		},
	});

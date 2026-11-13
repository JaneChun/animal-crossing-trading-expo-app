import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Theme, useThemedStyles } from '@/theme';
import spinnerImage from '@assets/images/spinner.gif';

const InlineLoadingIndicator = () => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.inlineLoadingContainer}>
			<FastImage source={spinnerImage} style={{ height: 100, width: 100 }} />
		</View>
	);
};

export default InlineLoadingIndicator;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		loadingContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: colors.bg.primary,
		},
		inlineLoadingContainer: {
			justifyContent: 'center',
			alignItems: 'center',
		},
	});

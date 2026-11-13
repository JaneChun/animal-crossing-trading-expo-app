import { StyleSheet, View } from 'react-native';

import ThreeDotsLoadingIndicator from '@/components/ui/loading/ThreeDotsLoadingIndicator';
import { Theme, useThemedStyles } from '@/theme';

const PostSummaryLoading = () => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.container}>
			<ThreeDotsLoadingIndicator />
		</View>
	);
};

export default PostSummaryLoading;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			paddingHorizontal: 16,
			height: 70,
			borderColor: colors.border.default,
			borderWidth: 1,
			backgroundColor: colors.bg.raised,
			borderRadius: 8,
		},
	});

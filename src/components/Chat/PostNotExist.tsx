import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { Theme, useTheme, useThemedStyles } from '@/theme';

const PostNotExist = () => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.container}>
			<Feather name="alert-circle" color={colors.text.tertiary} size={16} />
			<Text variant="body2" color="tertiary" style={styles.invalidPostText}>
				게시글을 찾을 수 없습니다.
			</Text>
		</View>
	);
};

export default PostNotExist;

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
		backgroundColor: colors.bg.primary,
		borderRadius: 8,
		gap: 6,
	},
	invalidPostText: {
		alignSelf: 'center',
	},
});

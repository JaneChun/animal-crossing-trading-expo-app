import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import Text from '@/components/ui/Text';
import { Spacing, Theme, useThemedStyles } from '@/theme';

// 섹션 하단 가운데 링크 (전체 보기, 프로필 보기)
const ViewAllLink = ({ label, onPress }: { label: string; onPress: () => void }) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<Pressable style={styles.link} onPress={onPress}>
			<Text variant="body2" weight="semibold" color="secondary">
				{label}
			</Text>
			<Ionicons name="chevron-forward" size={16} color={styles.icon.color} />
		</Pressable>
	);
};

export default ViewAllLink;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		link: {
			height: 44,
			marginTop: Spacing.s,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: Spacing.xxs,
		},
		icon: {
			color: colors.text.secondary,
		},
	});

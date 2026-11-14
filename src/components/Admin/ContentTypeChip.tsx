import { MaterialIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';

export type ContentType = 'post' | 'comment' | 'reply' | 'chat' | 'profile';

const CONTENT_TYPE_META: Record<
	ContentType,
	{ label: string; icon: ComponentProps<typeof MaterialIcons>['name'] }
> = {
	post: { label: '게시글', icon: 'article' },
	comment: { label: '댓글', icon: 'mode-comment' },
	reply: { label: '답글', icon: 'reply' },
	chat: { label: '채팅', icon: 'textsms' },
	profile: { label: '프로필', icon: 'person' },
};

const ContentTypeChip = ({ type }: { type: ContentType }) => {
	const styles = useThemedStyles(makeStyles);
	const { label, icon } = CONTENT_TYPE_META[type];

	return (
		<View style={styles.chip}>
			<MaterialIcons name={icon} size={14} color={styles.label.color} />
			<Text variant="caption" weight="semibold" color="tertiary" style={styles.label}>
				{label}
			</Text>
		</View>
	);
};

export default ContentTypeChip;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		chip: {
			flexDirection: 'row',
			alignItems: 'center',
			alignSelf: 'flex-start',
			gap: Spacing.xs,
			paddingVertical: Spacing.xs,
			paddingHorizontal: Spacing.s,
			borderRadius: BorderRadius.full,
			backgroundColor: colors.bg.fill,
		},
		label: {
			color: colors.text.tertiary,
		},
	});

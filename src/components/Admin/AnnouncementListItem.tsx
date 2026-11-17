import { Pressable, StyleSheet } from 'react-native';

import Text from '@/components/ui/Text';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { Announcement } from '@/types/announcement';
import { formatKstLongDate } from '@/utilities/kstDate';
import { navigateToAdminAnnouncementEdit } from '@/utilities/navigationHelpers';

const AnnouncementListItem = ({ announcement }: { announcement: Announcement }) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<Pressable
			style={styles.item}
			onPress={() => navigateToAdminAnnouncementEdit(announcement.id)}
		>
			<Text variant="body1" numberOfLines={1}>
				{announcement.title}
			</Text>
			<Text variant="caption" color="tertiary">
				{formatKstLongDate(announcement.createdAt.toDate())}
			</Text>
		</Pressable>
	);
};

export default AnnouncementListItem;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		item: {
			gap: 6,
			paddingVertical: Spacing.m,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
		},
	});

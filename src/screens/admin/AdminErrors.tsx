import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import InfiniteList from '@/components/Admin/InfiniteList';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { useAdminErrors } from '@/hooks/admin/query/useAdminErrors';
import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';
import { ErrorLog } from '@/types/admin';
import { formatKstDateTime } from '@/utilities/kstDate';

const AdminErrors = () => {
	const styles = useThemedStyles(makeStyles);
	const [openErrorId, setOpenErrorId] = useState<string | null>(null);
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useAdminErrors();

	const renderError = ({ item }: { item: ErrorLog }) => {
		const isOpen = item.id === openErrorId;
		const firstLine = item.message?.split('\n')[0] ?? '';
		const meta = [item.timestamp && formatKstDateTime(item.timestamp.toDate()), item.platform]
			.filter(Boolean)
			.join(' · ');

		return (
			<View style={styles.item}>
				<Pressable
					style={styles.header}
					onPress={() => setOpenErrorId(isOpen ? null : item.id)}
					accessibilityState={{ expanded: isOpen }}
				>
					<View style={styles.texts}>
						<Text variant="body1" weight="semibold" numberOfLines={2}>
							{firstLine}
						</Text>
						<Text variant="caption" color="tertiary">
							{meta}
						</Text>
					</View>
					<Ionicons
						name={isOpen ? 'chevron-up' : 'chevron-down'}
						size={18}
						color={styles.chevron.color}
					/>
				</Pressable>
				{isOpen && (
					<Text variant="caption" color="secondary" style={styles.stack} selectable>
						{item.stack || item.message}
					</Text>
				)}
			</View>
		);
	};

	return (
		<AdminGuard>
			<View style={styles.screen}>
				<InfiniteList
					data={data}
					keyExtractor={(error) => error.id}
					renderItem={renderError}
					isLoading={isLoading}
					isError={isError}
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					fetchNextPage={fetchNextPage}
					emptyMessage="에러 내역이 없습니다."
				/>
			</View>
		</AdminGuard>
	);
};

export default AdminErrors;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		item: {
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
		},
		header: {
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: Spacing.m,
			paddingVertical: Spacing.m,
			paddingHorizontal: PADDING,
		},
		texts: {
			flex: 1,
			gap: Spacing.xs,
		},
		chevron: {
			color: colors.text.tertiary,
		},
		stack: {
			marginHorizontal: PADDING,
			marginBottom: Spacing.l,
			padding: Spacing.m,
			borderRadius: BorderRadius.s,
			backgroundColor: colors.bg.fill,
			fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
		},
	});

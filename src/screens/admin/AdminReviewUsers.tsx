import { StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import InfiniteList from '@/components/Admin/InfiniteList';
import SuspensionBadge from '@/components/Admin/SuspensionBadge';
import UserRow from '@/components/Admin/UserRow';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { useNeedsReviewUsers } from '@/hooks/admin/query/useNeedsReviewUsers';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { navigateToAdminUserDetail } from '@/utilities/navigationHelpers';

const AdminReviewUsers = () => {
	const styles = useThemedStyles(makeStyles);
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useNeedsReviewUsers();

	return (
		<AdminGuard>
			<View style={styles.screen}>
				<Text variant="caption" color="tertiary" style={styles.description}>
					최근 30일 신고 7회 이상으로 30일 자동 정지된 유저입니다.
				</Text>
				<InfiniteList
					data={data}
					keyExtractor={(user) => user.uid}
					renderItem={({ item }) => (
						<UserRow
							user={item}
							isListItem
							onPress={() => navigateToAdminUserDetail({ uid: item.uid })}
							right={<SuspensionBadge suspendUntil={item.report?.suspendUntil} />}
						/>
					)}
					isLoading={isLoading}
					isError={isError}
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					fetchNextPage={fetchNextPage}
					emptyMessage="검토가 필요한 유저가 없습니다."
				/>
			</View>
		</AdminGuard>
	);
};

export default AdminReviewUsers;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		description: {
			paddingVertical: Spacing.m,
			paddingHorizontal: PADDING,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
		},
	});

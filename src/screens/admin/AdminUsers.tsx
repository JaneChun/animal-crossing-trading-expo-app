import { StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import InfiniteList from '@/components/Admin/InfiniteList';
import { isSuspended } from '@/components/Admin/SuspensionBadge';
import UserRow from '@/components/Admin/UserRow';
import Badge from '@/components/ui/Badge';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { useAdminUsers } from '@/hooks/admin/query/useAdminUsers';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { UserInfo } from '@/types/user';
import { elapsedTime } from '@/utilities/elapsedTime';
import { navigateToAdminUserDetail } from '@/utilities/navigationHelpers';

const AdminUsers = () => {
	const styles = useThemedStyles(makeStyles);
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useAdminUsers();

	const renderUser = ({ item }: { item: UserInfo }) => (
		<UserRow
			user={item}
			isListItem
			onPress={() => navigateToAdminUserDetail({ uid: item.uid })}
			nameAccessory={
				<>
					{isSuspended(item.report?.suspendUntil) && <Badge text="정지" tone="danger" />}
					{item.role === 'admin' && <Badge text="관리자" tone="brand" />}
				</>
			}
			right={
				item.lastActiveAt && (
					<Text variant="caption" color="tertiary" style={styles.lastActive}>
						{elapsedTime(item.lastActiveAt)}
					</Text>
				)
			}
		/>
	);

	return (
		<AdminGuard>
			<View style={styles.screen}>
				<Text variant="caption" color="tertiary" style={styles.description}>
					최근 접속순
				</Text>
				<InfiniteList
					data={data}
					keyExtractor={(user) => user.uid}
					renderItem={renderUser}
					isLoading={isLoading}
					isError={isError}
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					fetchNextPage={fetchNextPage}
					emptyMessage="최근 접속한 유저가 없습니다."
				/>
			</View>
		</AdminGuard>
	);
};

export default AdminUsers;

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
		lastActive: {
			alignSelf: 'flex-start',
			marginTop: Spacing.xs,
		},
	});

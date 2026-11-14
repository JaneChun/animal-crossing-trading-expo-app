import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StyleSheet } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import InfiniteList from '@/components/Admin/InfiniteList';
import ReportListItem from '@/components/Admin/ReportListItem';
import { PADDING } from '@/components/ui/layout/Layout';
import { useAdminReports } from '@/hooks/admin/query/useAdminReports';
import { FontSizes, FontWeights, useTheme } from '@/theme';

const Tab = createMaterialTopTabNavigator();

const ReportList = ({ resolved }: { resolved: boolean }) => {
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useAdminReports(resolved);

	return (
		<InfiniteList
			data={data}
			keyExtractor={(report) => report.id}
			renderItem={({ item }) => <ReportListItem report={item} />}
			isLoading={isLoading}
			isError={isError}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			fetchNextPage={fetchNextPage}
			emptyMessage={resolved ? '처리 완료된 신고가 없습니다.' : '접수된 신고가 없습니다.'}
			contentContainerStyle={styles.list}
		/>
	);
};

const OpenReports = () => <ReportList resolved={false} />;
const ResolvedReports = () => <ReportList resolved />;

const AdminReports = () => {
	const { colors } = useTheme();

	return (
		<AdminGuard>
			<Tab.Navigator
				screenOptions={{
					tabBarLabelStyle: {
						fontSize: FontSizes.sm,
						fontWeight: FontWeights.semibold,
					},
					tabBarStyle: {
						backgroundColor: colors.bg.primary,
					},
					// 기본 배경은 내비게이션 테마의 회색이라 목록 좌우 여백에 드러난다
					sceneStyle: { backgroundColor: colors.bg.primary },
					tabBarIndicatorStyle: { backgroundColor: colors.brand.primary },
					tabBarActiveTintColor: colors.brand.primary,
					tabBarInactiveTintColor: colors.text.tertiary,
				}}
			>
				<Tab.Screen name="접수" component={OpenReports} />
				<Tab.Screen name="처리완료" component={ResolvedReports} />
			</Tab.Navigator>
		</AdminGuard>
	);
};

export default AdminReports;

const styles = StyleSheet.create({
	list: {
		paddingHorizontal: PADDING,
	},
});

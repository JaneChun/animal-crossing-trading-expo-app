import { Feather } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import AnnouncementListItem from '@/components/Admin/AnnouncementListItem';
import InfiniteList from '@/components/Admin/InfiniteList';
import { PADDING } from '@/components/ui/layout/Layout';
import { useAdminAnnouncements } from '@/hooks/admin/query/useAdminAnnouncements';
import { FontSizes, FontWeights, useTheme } from '@/theme';
import { RootStackNavigation } from '@/types/navigation';
import { navigateToAdminAnnouncementEdit } from '@/utilities/navigationHelpers';

const Tab = createMaterialTopTabNavigator();

// 공지는 2~3개라 페이지네이션 없이 한 번에 받아 InfiniteList의 빈 목록·로딩·오류 처리만 쓴다
const AnnouncementList = ({ hidden }: { hidden: boolean }) => {
	const { data, isLoading, isError } = useAdminAnnouncements(hidden);

	return (
		<InfiniteList
			data={data}
			keyExtractor={(announcement) => announcement.id}
			renderItem={({ item }) => <AnnouncementListItem announcement={item} />}
			isLoading={isLoading}
			isError={isError}
			hasNextPage={false}
			isFetchingNextPage={false}
			fetchNextPage={() => {}}
			emptyMessage={hidden ? '숨긴 공지가 없습니다.' : '게시 중인 공지가 없습니다.'}
			contentContainerStyle={styles.list}
		/>
	);
};

const PublishedAnnouncements = () => <AnnouncementList hidden={false} />;
const HiddenAnnouncements = () => <AnnouncementList hidden />;

const AdminAnnouncements = () => {
	const { colors } = useTheme();
	const stackNavigation = useNavigation<RootStackNavigation>();

	useEffect(() => {
		stackNavigation.setOptions({
			headerRight: () => (
				<Pressable
					onPress={() => navigateToAdminAnnouncementEdit()}
					accessibilityRole="button"
					accessibilityLabel="새 공지"
				>
					<Feather name="plus" size={24} color={colors.text.primary} />
				</Pressable>
			),
		});
	}, [stackNavigation, colors.text.primary]);

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
				<Tab.Screen name="게시 중" component={PublishedAnnouncements} />
				<Tab.Screen name="숨김" component={HiddenAnnouncements} />
			</Tab.Navigator>
		</AdminGuard>
	);
};

export default AdminAnnouncements;

const styles = StyleSheet.create({
	list: {
		paddingHorizontal: PADDING,
	},
});

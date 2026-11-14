import { ScrollView, StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import SettingListItem from '@/components/Profile/SettingListItem';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';
import {
	navigateToAdminErrors,
	navigateToAdminReports,
	navigateToAdminReviewUsers,
	navigateToAdminStats,
	navigateToAdminUsers,
	navigateToDesignSystem,
} from '@/utilities/navigationHelpers';

const AdminHome = () => {
	const styles = useThemedStyles(makeStyles);

	return (
		<AdminGuard>
			<ScrollView style={styles.screen} contentContainerStyle={styles.content}>
				<View style={styles.container}>
					<Text variant="body1" weight="semibold" style={styles.title}>
						운영
					</Text>
					<SettingListItem borderRound="top" showChevron onPress={navigateToAdminReports}>
						<Text variant="body1">신고 관리</Text>
					</SettingListItem>
					<SettingListItem showChevron onPress={navigateToAdminReviewUsers}>
						<Text variant="body1">검토 필요 유저</Text>
					</SettingListItem>
					<SettingListItem
						borderRound="bottom"
						showChevron
						onPress={navigateToAdminErrors}
					>
						<Text variant="body1">에러 내역</Text>
					</SettingListItem>
				</View>

				<View style={styles.container}>
					<Text variant="body1" weight="semibold" style={styles.title}>
						사용 현황
					</Text>
					<SettingListItem borderRound="top" showChevron onPress={navigateToAdminStats}>
						<Text variant="body1">일별 통계</Text>
					</SettingListItem>
					<SettingListItem
						borderRound="bottom"
						showChevron
						onPress={navigateToAdminUsers}
					>
						<Text variant="body1">유저</Text>
					</SettingListItem>
				</View>

				<View>
					<Text variant="body1" weight="semibold" style={styles.title}>
						개발
					</Text>
					<SettingListItem borderRound="all" showChevron onPress={navigateToDesignSystem}>
						<Text variant="body1">디자인 시스템</Text>
					</SettingListItem>
				</View>
			</ScrollView>
		</AdminGuard>
	);
};

export default AdminHome;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		content: {
			padding: PADDING,
		},
		container: {
			marginBottom: 32,
		},
		title: {
			marginBottom: 16,
		},
	});

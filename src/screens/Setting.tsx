import { Linking, StyleSheet, View } from 'react-native';

import PushNotificationToggle from '@/components/Profile/PushNotificationToggle';
import SettingListItem from '@/components/Profile/SettingListItem';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { useAuthStore, useUserInfo } from '@/stores/auth';
import { Theme, useThemedStyles } from '@/theme';
import {
	navigateToAccount,
	navigateToAdminHome,
	navigateToBlock,
	navigateToPrivacyPolicy,
	navigateToTermsOfService,
} from '@/utilities/navigationHelpers';

const Setting = () => {
	const styles = useThemedStyles(makeStyles);
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
	const userInfo = useUserInfo();

	if (isAuthLoading) return <LoadingIndicator />;

	return (
		<View style={styles.screen}>
			<View style={styles.container}>
				<Text variant="body1" weight="semibold" style={styles.title}>
					사용자 설정
				</Text>
				<SettingListItem
					borderRound="top"
					showChevron
					onPress={navigateToAccount}
					testID="myAccountButton"
				>
					<Text variant="body1">내 계정</Text>
				</SettingListItem>
				<SettingListItem style={styles.pushNotificationRow}>
					<View style={styles.flexRow}>
						<Text variant="body1">푸시 알림</Text>
						<PushNotificationToggle />
					</View>
				</SettingListItem>
				<SettingListItem borderRound="bottom" showChevron onPress={navigateToBlock}>
					<Text variant="body1">차단 사용자 관리</Text>
				</SettingListItem>
			</View>

			<View style={styles.container}>
				<Text variant="body1" weight="semibold" style={styles.title}>
					앱 정보
				</Text>
				<SettingListItem
					borderRound="top"
					showChevron
					onPress={() => {
						Linking.openURL('mailto:janechun22@gmail.com');
					}}
				>
					<Text variant="body1">문의하기</Text>
				</SettingListItem>
				<SettingListItem showChevron onPress={navigateToTermsOfService}>
					<Text variant="body1">이용약관</Text>
				</SettingListItem>
				<SettingListItem borderRound="bottom" showChevron onPress={navigateToPrivacyPolicy}>
					<Text variant="body1">개인정보 처리방침</Text>
				</SettingListItem>
				{/* <SettingListItem borderRound='bottom' onPress={() => {}}>
					<Text variant="body1">앱 버전 정보</Text>
				</SettingListItem> */}
			</View>

			{userInfo?.role === 'admin' && (
				<View style={styles.container}>
					<Text variant="body1" weight="semibold" style={styles.title}>
						관리자
					</Text>
					<SettingListItem borderRound="all" showChevron onPress={navigateToAdminHome}>
						<Text variant="body1">관리자 페이지</Text>
					</SettingListItem>
				</View>
			)}
		</View>
	);
};

export default Setting;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
			padding: PADDING,
		},
		container: {
			marginBottom: 32,
		},
		title: {
			marginBottom: 16,
		},
		flexRow: {
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		pushNotificationRow: {
			paddingVertical: 10,
		},
	});

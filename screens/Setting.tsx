import PushNotificationToggle from '@/components/Profile/PushNotificationToggle';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useAuthStore } from '@/stores/auth';
import {
	navigateToAccount,
	navigateToBlock,
	navigateToPrivacyPolicy,
	navigateToTermsOfService,
} from '@/utilities/navigationHelpers';
import { Linking, StyleSheet, Text, View } from 'react-native';
import SettingListItem from '../components/Profile/SettingListItem';

const Setting = () => {
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

	if (isAuthLoading) return <LoadingIndicator />;

	return (
		<View style={styles.screen}>
			<View style={styles.container}>
				<Text style={styles.title}>사용자 설정</Text>
				<SettingListItem
					borderRound='top'
					showChevron
					onPress={navigateToAccount}
					testID='myAccountButton'
				>
					<Text style={styles.text}>내 계정</Text>
				</SettingListItem>
				<SettingListItem style={styles.pushNotificationRow}>
					<View style={styles.flexRow}>
						<Text style={styles.text}>푸시 알림</Text>
						<PushNotificationToggle />
					</View>
				</SettingListItem>
				<SettingListItem
					borderRound='bottom'
					showChevron
					onPress={navigateToBlock}
				>
					<Text style={styles.text}>차단 사용자 관리</Text>
				</SettingListItem>
			</View>

			<View style={styles.container}>
				<Text style={styles.title}>앱 정보</Text>
				<SettingListItem
					borderRound='top'
					showChevron
					onPress={() => {
						Linking.openURL('mailto:janechun22@gmail.com');
					}}
				>
					<Text style={styles.text}>문의하기</Text>
				</SettingListItem>
				<SettingListItem showChevron onPress={navigateToTermsOfService}>
					<Text style={styles.text}>이용약관</Text>
				</SettingListItem>
				<SettingListItem
					borderRound='bottom'
					showChevron
					onPress={navigateToPrivacyPolicy}
				>
					<Text style={styles.text}>개인정보 처리방침</Text>
				</SettingListItem>
				{/* <SettingListItem borderRound='bottom' onPress={() => {}}>
					<Text style={styles.text}>앱 버전 정보</Text>
				</SettingListItem> */}
			</View>
		</View>
	);
};

export default Setting;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
		padding: PADDING,
	},
	container: {
		marginBottom: 32,
	},
	title: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		marginBottom: 16,
	},
	text: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.regular,
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

import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useAuthStore } from '@/stores/AuthStore';
import { navigateToAccount } from '@/utilities/navigationHelpers';
import { StyleSheet, Text, View } from 'react-native';
import SettingListItem from '../components/Profile/SettingListItem';

const Setting = () => {
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

	if (isAuthLoading) return <LoadingIndicator />;

	return (
		<View style={styles.screen}>
			<View style={styles.container}>
				<Text style={styles.title}>개인 정보 설정</Text>
				<SettingListItem
					borderRound='all'
					showChevron
					onPress={() => navigateToAccount()}
				>
					<Text style={styles.text}>내 계정</Text>
				</SettingListItem>
			</View>

			<View style={styles.container}>
				<Text style={styles.title}>앱 설정</Text>
				<SettingListItem borderRound='top' onPress={() => {}}>
					<Text style={styles.text}>알림 수신 설정</Text>
				</SettingListItem>
				<SettingListItem onPress={() => {}}>
					<Text style={styles.text}>문의하기</Text>
				</SettingListItem>
				<SettingListItem onPress={() => {}}>
					<Text style={styles.text}>개인정보 처리방침</Text>
				</SettingListItem>
				<SettingListItem onPress={() => {}}>
					<Text style={styles.text}>이용약관</Text>
				</SettingListItem>
				<SettingListItem borderRound='bottom' onPress={() => {}}>
					<Text style={styles.text}>앱 버전 정보</Text>
				</SettingListItem>
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
});

import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { goBack } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Setting = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const kakaoLogout = useAuthStore((state) => state.kakaoLogout);
	const naverLogout = useAuthStore((state) => state.naverLogout);
	const kakaoDeleteAccount = useAuthStore((state) => state.kakaoDeleteAccount);
	const naverDeleteAccount = useAuthStore((state) => state.naverDeleteAccount);

	const handleLogout = () => {
		Alert.alert('로그아웃', '정말로 로그아웃할까요?', [
			{ text: '닫기', style: 'cancel' },
			{ text: '로그아웃', onPress: onConfirmLogout },
		]);
	};

	const onConfirmLogout = async () => {
		if (!userInfo) return;

		let isSuccess: boolean | void = false;

		if (userInfo.oauthType === 'kakao') isSuccess = await kakaoLogout();
		else if (userInfo.oauthType === 'naver') isSuccess = await naverLogout();

		if (Boolean(isSuccess)) {
			showToast('success', '로그아웃되었습니다.');
			goBack();
		} else {
			showToast('error', '로그아웃 실패. 다시 시도해주세요.');
		}
	};

	const handleDeleteAccount = async () => {
		Alert.alert(
			'회원 탈퇴',
			'정말로 탈퇴하시겠습니까?\n탈퇴한 계정은 삭제되며 복구되지 않습니다.',
			[
				{ text: '닫기', style: 'cancel' },
				{
					text: '네, 동의합니다.',
					onPress: onConfirmDeleteAccount,
				},
			],
		);
	};

	const onConfirmDeleteAccount = async () => {
		if (!userInfo) return;

		let isSuccess: boolean | void = false;

		if (userInfo.oauthType === 'kakao')
			isSuccess = await kakaoDeleteAccount(userInfo.uid);
		else if (userInfo.oauthType === 'naver')
			isSuccess = await naverDeleteAccount(userInfo.uid);

		if (Boolean(isSuccess)) {
			Alert.alert('탈퇴 완료', '탈퇴 처리가 성공적으로 완료되었습니다.');
			goBack();
		} else {
			Alert.alert('탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
		}
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.row} onPress={() => {}}>
				<Text style={styles.text}>알림 수신 설정</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.row} onPress={handleLogout}>
				<Text style={styles.text}>로그아웃</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
				<Text style={styles.text}>탈퇴하기</Text>
			</TouchableOpacity>
		</View>
	);
};

export default Setting;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 8,
		backgroundColor: 'white',
	},
	row: {
		padding: 18,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	text: {
		fontSize: 16,
		fontWeight: 500,
	},
});

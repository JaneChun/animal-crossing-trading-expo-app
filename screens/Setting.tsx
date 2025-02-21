import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { TabNavigation } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Setting = () => {
	const navigation = useNavigation<TabNavigation>();
	const { logout, deleteAccount } = useAuthContext();
	const { userInfo } = useAuthContext();

	const handleLogout = () => {
		Alert.alert('로그아웃', '정말로 로그아웃할까요?', [
			{ text: '닫기', style: 'cancel' },
			{ text: '로그아웃', onPress: onConfirmLogout },
		]);
	};

	const onConfirmLogout = async () => {
		const isSuccess: boolean | void = await logout();

		if (Boolean(isSuccess)) {
			navigation.reset({
				index: 0,
				routes: [{ name: 'Home' }],
			});
		} else {
			Alert.alert('로그아웃 실패', '다시 시도해주세요.');
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

		try {
			await deleteAccount(userInfo.uid);

			Alert.alert('탈퇴 완료', '탈퇴 처리가 성공적으로 완료되었습니다.');
			navigation.goBack();
		} catch (e: any) {
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
		padding: 16,
		backgroundColor: 'white',
	},
	row: {
		paddingVertical: 18,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	text: {
		fontSize: 16,
		fontWeight: 500,
	},
});

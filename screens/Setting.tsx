import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { goBack } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Setting = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const kakaoLogout = useAuthStore((state) => state.kakaoLogout);
	const naverLogout = useAuthStore((state) => state.naverLogout);
	const kakaoDeleteAccount = useAuthStore((state) => state.kakaoDeleteAccount);
	const naverDeleteAccount = useAuthStore((state) => state.naverDeleteAccount);
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

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
			goBack();
			showToast('success', '로그아웃되었습니다.');
		} else {
			showToast('error', '로그아웃 실패. 다시 시도해주세요.');
		}
	};

	const handleDeleteAccount = async () => {
		Alert.alert(
			'회원 탈퇴',
			'정말로 탈퇴하시겠습니까?\n탈퇴한 계정은 삭제되며 복구되지 않습니다.',
			[
				{ text: '취소', style: 'cancel' },
				{
					text: '회원 탈퇴하기',
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

	if (isAuthLoading) return <LoadingIndicator />;

	return (
		<View style={styles.screen}>
			<View style={styles.container}>
				<Text style={styles.title}>내 계정</Text>
				<TouchableOpacity
					style={[styles.row, styles.topRow, styles.bottomRow]}
					onPress={() => {}}
				>
					<Text style={styles.text}>이메일</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.container}>
				<Text style={styles.title}>앱 설정</Text>
				<TouchableOpacity
					style={[styles.row, styles.topRow]}
					onPress={() => {}}
				>
					<Text style={styles.text}>알림 수신</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.row} onPress={() => {}}>
					<Text style={styles.text}>문의하기</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.row} onPress={() => {}}>
					<Text style={styles.text}>개인정보 처리방침</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.row} onPress={handleLogout}>
					<Text style={styles.text}>로그아웃</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.row, styles.bottomRow]}
					onPress={handleDeleteAccount}
				>
					<Text style={styles.text}>탈퇴하기</Text>
					<Ionicons
						name='chevron-forward'
						size={20}
						color={Colors.font_black}
					/>
				</TouchableOpacity>
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
	row: {
		padding: 16,
		borderTopWidth: 1,
		borderColor: Colors.border_gray,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: Colors.base,
	},
	topRow: {
		borderTopWidth: 0,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
	},
	bottomRow: {
		borderBottomLeftRadius: 10,
		borderBottomRightRadius: 10,
	},
	text: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.regular,
	},
});

import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useAuthStore } from '@/stores/AuthStore';
import { navigateToAccount } from '@/utilities/navigationHelpers';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Setting = () => {
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

	if (isAuthLoading) return <LoadingIndicator />;

	return (
		<View style={styles.screen}>
			<View style={styles.container}>
				<Text style={styles.title}>개인 정보 설정</Text>
				<TouchableOpacity
					style={[styles.row, styles.topRow, styles.bottomRow]}
					onPress={() => navigateToAccount()}
				>
					<Text style={styles.text}>내 계정</Text>
					<Ionicons
						name='chevron-forward'
						size={20}
						color={Colors.font_black}
					/>
				</TouchableOpacity>
			</View>

			<View style={styles.container}>
				<Text style={styles.title}>앱 설정</Text>
				<TouchableOpacity
					style={[styles.row, styles.topRow]}
					onPress={() => {}}
				>
					<Text style={styles.text}>알림 수신 설정</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.row} onPress={() => {}}>
					<Text style={styles.text}>문의하기</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.row} onPress={() => {}}>
					<Text style={styles.text}>개인정보 처리방침</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.row} onPress={() => {}}>
					<Text style={styles.text}>이용약관</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.row, styles.bottomRow]}
					onPress={() => {}}
				>
					<Text style={styles.text}>앱 버전 정보</Text>
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

import Button from '@/components/ui/Button';
import CloseButton from '@/components/ui/CloseButton';
import { PADDING } from '@/components/ui/layout/Layout';
import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { goBack } from '@/navigation/RootNavigation';
import { SignUpDisplayNameRouteProp } from '@/types/navigation';
import {
	navigateToPrivacyPolicy,
	navigateToSignUp,
	navigateToTermsOfService,
} from '@/utilities/navigationHelpers';
import { useRoute } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AgreeToTermsAndConditions = () => {
	const [allAgree, setAllAgree] = useState(false);
	const [termsAgree, setTermsAgree] = useState(false);
	const [privacyAgree, setPrivacyAgree] = useState(false);

	const route = useRoute<SignUpDisplayNameRouteProp>();
	const { uid, oauthType, email } = route.params;

	// 전체 동의 토글 시 하위 항목 동기화
	useEffect(() => {
		if (allAgree) {
			setTermsAgree(true);
			setPrivacyAgree(true);
		}
	}, [allAgree]);

	// 하위 항목이 하나라도 해제되면 전체 동의 해제
	useEffect(() => {
		if (allAgree && (!termsAgree || !privacyAgree)) {
			setAllAgree(false);
		}
	}, [termsAgree, privacyAgree]);

	const handleNext = () => {
		navigateToSignUp({
			uid,
			oauthType,
			email,
		});
	};

	const backToProfile = () => {
		goBack();
	};

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<View style={styles.container}>
				{/* 닫기 버튼 */}
				<CloseButton style={styles.closeButton} onPress={backToProfile} />

				{/* 타이틀 */}
				<Text style={styles.title}>{'모동숲 마켓\n이용약관 동의'}</Text>
				<Text style={styles.subtitle}>
					원활한 서비스 이용을 위해 아래 약관에 동의해주세요.
				</Text>

				<View style={styles.infoBox}>
					{/* 전체 동의 */}
					<View style={styles.row}>
						<Checkbox
							value={allAgree}
							onValueChange={setAllAgree}
							color={allAgree ? Colors.primary : undefined}
							style={styles.checkbox}
							testID='allAgreeCheckbox'
						/>
						<Text style={styles.largeLabel}>전체 약관 동의</Text>
					</View>

					<View style={styles.divider} />

					{/* 이용약관 */}
					<View style={styles.row}>
						<Checkbox
							value={termsAgree}
							onValueChange={setTermsAgree}
							color={termsAgree ? Colors.primary : undefined}
							style={styles.checkbox}
						/>
						<Text style={styles.label}>서비스 이용약관 (필수)</Text>
						<TouchableOpacity onPress={navigateToTermsOfService}>
							<Text style={styles.link}>자세히 보기</Text>
						</TouchableOpacity>
					</View>

					{/* 서비스 약관 */}
					<View style={styles.row}>
						<Checkbox
							value={privacyAgree}
							onValueChange={setPrivacyAgree}
							color={privacyAgree ? Colors.primary : undefined}
							style={styles.checkbox}
						/>
						<Text style={styles.label}>개인정보 수집 및 이용 동의 (필수)</Text>
						<TouchableOpacity onPress={navigateToPrivacyPolicy}>
							<Text style={styles.link}>자세히 보기</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/*  버튼 */}
				<Button
					disabled={!termsAgree || !privacyAgree}
					onPress={handleNext}
					color='mint'
					size='lg'
					style={styles.button}
				>
					동의하고 계속하기
				</Button>
			</View>
		</SafeAreaView>
	);
};

export default AgreeToTermsAndConditions;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
		padding: PADDING,
	},
	closeButton: {
		alignSelf: 'flex-end',
		padding: 0,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginTop: 24,
		marginBottom: 8,
		lineHeight: 32,
	},
	subtitle: {
		fontSize: 14,
		color: Colors.font_gray,
		marginBottom: 24,
	},
	infoBox: {
		backgroundColor: Colors.base,
		borderRadius: 10,
		paddingHorizontal: 24,
		paddingVertical: 32,
		marginBottom: 24,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	largeLabel: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.bold,
		color: Colors.font_black,
		marginLeft: 8,
	},
	label: {
		flex: 1,
		fontSize: FontSizes.md,
		color: Colors.font_black,
		marginLeft: 8,
	},
	divider: {
		height: 1,
		backgroundColor: '#e1e1e1',
		marginBottom: 16,
	},
	link: {
		fontSize: 14,
		color: Colors.font_gray,
		marginLeft: 8,
		borderBottomWidth: 1,
		borderColor: Colors.font_gray,
	},
	checkbox: {
		borderRadius: '50%',
	},
	button: {
		marginTop: 'auto',
	},
});

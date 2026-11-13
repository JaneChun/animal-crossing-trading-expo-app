import { useRoute } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import CloseButton from '@/components/ui/CloseButton';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { goBack } from '@/navigation/RootNavigation';
import { Theme, useTheme, useThemedStyles } from '@/theme';
import { SignUpDisplayNameRouteProp } from '@/types/navigation';
import {
	navigateToPrivacyPolicy,
	navigateToSignUp,
	navigateToTermsOfService,
} from '@/utilities/navigationHelpers';

const AgreeToTermsAndConditions = () => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);
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
				<Text variant="display" weight="bold" style={styles.title}>
					{'모동숲 마켓\n이용약관 동의'}
				</Text>
				<Text variant="body2" color="tertiary" style={styles.subtitle}>
					원활한 서비스 이용을 위해 아래 약관에 동의해주세요.
				</Text>

				<View style={styles.infoBox}>
					{/* 전체 동의 */}
					<View style={styles.row}>
						<Checkbox
							value={allAgree}
							onValueChange={setAllAgree}
							color={allAgree ? colors.brand.primary : undefined}
							style={styles.checkbox}
							testID="allAgreeCheckbox"
						/>
						<Text variant="heading" weight="bold" style={styles.largeLabel}>
							전체 약관 동의
						</Text>
					</View>

					<View style={styles.divider} />

					{/* 이용약관 */}
					<View style={styles.row}>
						<Checkbox
							value={termsAgree}
							onValueChange={setTermsAgree}
							color={termsAgree ? colors.brand.primary : undefined}
							style={styles.checkbox}
						/>
						<Text variant="body1" style={styles.label}>
							서비스 이용약관 (필수)
						</Text>
						<TouchableOpacity onPress={navigateToTermsOfService}>
							<Text variant="body2" color="tertiary" style={styles.link}>
								자세히 보기
							</Text>
						</TouchableOpacity>
					</View>

					{/* 서비스 약관 */}
					<View style={styles.row}>
						<Checkbox
							value={privacyAgree}
							onValueChange={setPrivacyAgree}
							color={privacyAgree ? colors.brand.primary : undefined}
							style={styles.checkbox}
						/>
						<Text variant="body1" style={styles.label}>
							개인정보 수집 및 이용 동의 (필수)
						</Text>
						<TouchableOpacity onPress={navigateToPrivacyPolicy}>
							<Text variant="body2" color="tertiary" style={styles.link}>
								자세히 보기
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/*  버튼 */}
				<Button
					disabled={!termsAgree || !privacyAgree}
					onPress={handleNext}
					variant="primary"
					size="lg"
					style={styles.button}
				>
					동의하고 계속하기
				</Button>
			</View>
		</SafeAreaView>
	);
};

export default AgreeToTermsAndConditions;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
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
			marginTop: 24,
			marginBottom: 8,
		},
		subtitle: {
			marginBottom: 24,
		},
		infoBox: {
			backgroundColor: colors.bg.fill,
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
			marginLeft: 8,
		},
		label: {
			flex: 1,
			marginLeft: 8,
		},
		divider: {
			height: 1,
			backgroundColor: colors.divider.thick,
			marginBottom: 16,
		},
		link: {
			marginLeft: 8,
			borderBottomWidth: 1,
			borderColor: colors.text.tertiary,
		},
		checkbox: {
			borderRadius: '50%',
		},
		button: {
			marginTop: 'auto',
		},
	});

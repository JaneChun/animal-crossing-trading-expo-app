import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PolicyCard from '@/components/Sanction/PolicyCard';
import { PADDING } from '@/components/ui/layout/Layout';
import { VIOLATION_TYPES } from '@/constants/sanction';
import { Spacing, Theme, useThemedStyles } from '@/theme';

// 운영 정책 (사용자·관리자 공용). 위반 유형마다 설명과 ✕/✓ 예시. 심각도와 내부 횟수 기준은 보여 주지 않는다
const OperationPolicy = () => {
	const styles = useThemedStyles(makeStyles);

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<ScrollView contentContainerStyle={styles.content}>
				{VIOLATION_TYPES.map(({ EN }, index) => (
					<View key={EN} style={[styles.policy, index > 0 && styles.policyDivider]}>
						<PolicyCard violationType={EN} />
					</View>
				))}
			</ScrollView>
		</SafeAreaView>
	);
};

export default OperationPolicy;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		content: {
			paddingHorizontal: PADDING,
			paddingBottom: Spacing.xxxl,
		},
		policy: {
			paddingVertical: Spacing.xxl,
		},
		policyDivider: {
			borderTopWidth: 1,
			borderColor: colors.border.default,
		},
	});

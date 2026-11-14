import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { VIOLATION_POLICIES, VIOLATION_TYPES } from '@/constants/sanction';
import { Spacing, useTheme } from '@/theme';
import { ViolationType } from '@/types/sanction';

// 위반 유형 하나의 운영 정책(제목, 설명, ✕/✓ 예시). 운영 정책 화면과 경고 화면이 함께 쓴다
const PolicyCard = ({ violationType }: { violationType: ViolationType }) => {
	const { colors } = useTheme();
	const title = VIOLATION_TYPES.find(({ EN }) => EN === violationType)?.KR;
	const { description, examples } = VIOLATION_POLICIES[violationType];

	return (
		<View style={styles.card}>
			<Text variant="body1" weight="semibold">
				{title}
			</Text>
			<Text variant="body2" color="secondary">
				{description}
			</Text>
			<View style={styles.examples}>
				{examples.map(({ allowed, text, sub }) => (
					<View key={text} style={styles.example}>
						<MaterialIcons
							name={allowed ? 'check' : 'close'}
							size={18}
							color={allowed ? colors.text.primaryBrand : colors.text.danger}
						/>
						<View style={styles.exampleTexts}>
							<Text variant="body2">{text}</Text>
							{!!sub && (
								<Text variant="caption" color="tertiary">
									{sub}
								</Text>
							)}
						</View>
					</View>
				))}
			</View>
		</View>
	);
};

export default PolicyCard;

const styles = StyleSheet.create({
	card: {
		gap: Spacing.m,
	},
	examples: {
		gap: Spacing.s,
	},
	example: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: Spacing.s,
	},
	exampleTexts: {
		flex: 1,
		gap: Spacing.xxs,
	},
});

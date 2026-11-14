import { Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { VIOLATION_TYPES } from '@/constants/sanction';
import { Theme, useThemedStyles } from '@/theme';
import { ViolationType } from '@/types/sanction';

type ViolationTypeListProps = {
	selected: ViolationType | null;
	onSelect: (type: ViolationType) => void;
};

// 위반 유형 6개 선택 목록. 신고 바텀시트(ReportModal)의 사유 목록과 같은 모양
const ViolationTypeList = ({ selected, onSelect }: ViolationTypeListProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.list}>
			{VIOLATION_TYPES.map(({ KR, EN }) => {
				const isSelected = selected === EN;
				return (
					<Pressable
						key={EN}
						style={[styles.item, isSelected && styles.selectedItem]}
						onPress={() => onSelect(EN)}
					>
						<Text
							variant="body1"
							weight={isSelected ? 'bold' : 'regular'}
							style={isSelected && styles.selectedText}
						>
							{KR}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
};

export default ViolationTypeList;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		list: {
			gap: 10,
		},
		item: {
			padding: 12,
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border.default,
		},
		selectedItem: {
			borderColor: colors.brand.primary,
			backgroundColor: colors.brand.secondary,
		},
		selectedText: {
			color: colors.brand.primary,
		},
	});

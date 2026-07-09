import { StyleSheet, Text } from 'react-native';

import { FontSizes, LineHeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { Spacing } from '@/theme/Spacing';

type FailedRowProps = {
	line: string;
	index: number;
};

// 어떤 검색으로도 매칭하지 못한 원문 라인
const FailedRow = ({ line, index }: FailedRowProps) => (
	<Text
		style={styles.failedLine}
		numberOfLines={2}
		ellipsizeMode="tail"
		testID={`bulkAddFailedRow-${index}`}
	>
		{line}
	</Text>
);

export default FailedRow;

const styles = StyleSheet.create({
	failedLine: {
		fontSize: FontSizes.sm,
		lineHeight: LineHeights.sm,
		color: Colors.text.tertiary,
		paddingVertical: Spacing.s,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border.default,
	},
});

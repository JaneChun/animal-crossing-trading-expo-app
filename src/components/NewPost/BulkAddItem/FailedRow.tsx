import { StyleSheet } from 'react-native';

import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';
import { Spacing } from '@/theme/Spacing';

type FailedRowProps = {
	line: string;
	index: number;
};

// 어떤 검색으로도 매칭하지 못한 원문 라인
const FailedRow = ({ line, index }: FailedRowProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<Text
			variant="body2"
			color="tertiary"
			style={styles.failedLine}
			numberOfLines={2}
			ellipsizeMode="tail"
			testID={`bulkAddFailedRow-${index}`}
		>
			{line}
		</Text>
	);
};

export default FailedRow;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		failedLine: {
			paddingVertical: Spacing.s,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
		},
	});

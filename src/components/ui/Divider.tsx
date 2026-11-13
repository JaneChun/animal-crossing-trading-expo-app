import { StyleSheet, View } from 'react-native';

import { SECTION_DIVIDER_HEIGHT, Theme, useThemedStyles } from '@/theme';
import { DividerProps } from '@/types/components';

/** thin: 리스트 아이템 구분, section: 섹션 구분 */
const Divider = ({ variant = 'thin', style }: DividerProps) => {
	const styles = useThemedStyles(makeStyles);

	return <View style={[styles[variant], style]} />;
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		thin: {
			height: 1,
			backgroundColor: colors.border.default,
		},
		section: {
			height: SECTION_DIVIDER_HEIGHT,
			backgroundColor: colors.bg.secondary,
		},
	});

export default Divider;

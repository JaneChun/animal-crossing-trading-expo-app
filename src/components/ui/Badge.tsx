import { StyleSheet, View } from 'react-native';

import { BorderRadius, ColorScheme, Spacing, useTheme } from '@/theme';
import { BadgeProps, BadgeTone } from '@/types/components';

import Text from './Text';

type ToneColorKey = keyof ColorScheme['text'] & keyof ColorScheme['bg'];

/** tone별로 짝지어진 `text.{key}` 글자색과 `bg.{key}` 배경색의 키 */
const TONE_COLOR_KEYS: Record<BadgeTone, ToneColorKey> = {
	red: 'red',
	orange: 'orange',
	yellow: 'yellow',
	green: 'green',
	blue: 'blue',
	lavender: 'lavender',
	purple: 'purple',
	brand: 'primaryBrand',
	neutral: 'tertiary',
};

const Badge = ({ text, tone, containerStyle }: BadgeProps) => {
	const { colors } = useTheme();
	// 정의되지 않은 tone이 들어오면 brand로 표시한다
	const colorKey = TONE_COLOR_KEYS[tone] ?? TONE_COLOR_KEYS.brand;

	return (
		<View style={containerStyle}>
			<Text
				variant="caption"
				weight="semibold"
				color={colorKey}
				style={[styles.badge, { backgroundColor: colors.bg[colorKey] }]}
			>
				{text}
			</Text>
		</View>
	);
};

export default Badge;

const styles = StyleSheet.create({
	badge: {
		paddingVertical: Spacing.xs,
		paddingHorizontal: 6,
		borderRadius: BorderRadius.xs,
	},
});

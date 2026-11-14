import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { BorderRadius, Spacing, useTheme } from '@/theme';
import { BannerProps } from '@/types/components';

import { TONE_COLOR_KEYS } from './Badge';
import Text from './Text';

// 아이콘 + 한 줄 문구의 둥근 안내 배너. 색은 Badge와 같은 tone 쌍(text.{key} + bg.{key})을 쓴다
const Banner = ({ tone, icon, text, containerStyle }: BannerProps) => {
	const { colors } = useTheme();
	const colorKey = TONE_COLOR_KEYS[tone] ?? TONE_COLOR_KEYS.brand;

	return (
		<View style={[styles.banner, { backgroundColor: colors.bg[colorKey] }, containerStyle]}>
			<Feather name={icon} size={15} color={colors.text[colorKey]} />
			<Text variant="body2" weight="semibold" color={colorKey}>
				{text}
			</Text>
		</View>
	);
};

export default Banner;

const styles = StyleSheet.create({
	banner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.s,
		borderRadius: BorderRadius.m,
		paddingVertical: Spacing.m,
		paddingHorizontal: Spacing.l,
	},
});

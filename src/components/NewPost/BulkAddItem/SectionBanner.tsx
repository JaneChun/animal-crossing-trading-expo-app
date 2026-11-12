import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { ColorScheme, useTheme } from '@/theme';
import { BorderRadius } from '@/theme/BorderRadius';
import { Spacing } from '@/theme/Spacing';

type BannerVariant = 'found' | 'review' | 'failed';

type ToneColorKey = keyof ColorScheme['text'] & keyof ColorScheme['bg'];

type SectionBannerProps = {
	variant: BannerVariant;
	text: string;
	// 앞 섹션이 있을 때 위쪽 간격 추가
	spaced: boolean;
};

/** variant별 아이콘과, Badge처럼 `text.{key}` 글자색·`bg.{key}` 배경색으로 짝지어진 tone 키 */
const BANNER_CONFIG: Record<
	BannerVariant,
	{ icon: React.ComponentProps<typeof Feather>['name']; colorKey: ToneColorKey }
> = {
	found: { icon: 'search', colorKey: 'primaryBrand' },
	review: { icon: 'alert-circle', colorKey: 'yellow' },
	failed: { icon: 'help-circle', colorKey: 'red' },
};

// 찾음/재확인/실패 세 섹션의 머리말 배너
const SectionBanner = ({ variant, text, spaced }: SectionBannerProps) => {
	const { colors } = useTheme();
	const { icon, colorKey } = BANNER_CONFIG[variant];

	return (
		<View
			style={[
				styles.banner,
				{ backgroundColor: colors.bg[colorKey] },
				spaced && styles.bannerSpaced,
			]}
		>
			<Feather name={icon} size={15} color={colors.text[colorKey]} />
			<Text variant="body2" weight="semibold" color={colorKey}>
				{text}
			</Text>
		</View>
	);
};

export default SectionBanner;

const styles = StyleSheet.create({
	banner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.s,
		borderRadius: BorderRadius.m,
		paddingVertical: Spacing.m,
		paddingHorizontal: Spacing.l,
		marginBottom: Spacing.m,
	},
	bannerSpaced: {
		marginTop: Spacing.l,
	},
});

import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FontSizes, FontWeights, LineHeights } from '@/constants/Typography';
import { BorderRadius } from '@/theme/BorderRadius';
import { Colors } from '@/theme/Color';
import { Spacing } from '@/theme/Spacing';

type BannerVariant = 'found' | 'review' | 'failed';

type SectionBannerProps = {
	variant: BannerVariant;
	text: string;
	// 앞 섹션이 있을 때 위쪽 간격 추가
	spaced: boolean;
};

// 찾음/재확인/실패 세 섹션의 머리말 배너
const SectionBanner = ({ variant, text, spaced }: SectionBannerProps) => {
	const config = BANNER_CONFIG[variant];

	return (
		<View style={[styles.banner, config.container, spaced && styles.bannerSpaced]}>
			<Feather name={config.icon} size={15} color={config.iconColor} />
			<Text style={[styles.bannerText, config.text]}>{text}</Text>
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
	bannerFound: {
		backgroundColor: Colors.bg.primaryBrand,
	},
	bannerReview: {
		backgroundColor: Colors.bg.yellow,
	},
	bannerFailed: {
		backgroundColor: Colors.bg.red,
	},
	bannerText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		lineHeight: LineHeights.sm,
	},
	bannerTextFound: {
		color: Colors.text.primaryBrand,
	},
	bannerTextReview: {
		color: Colors.text.yellow,
	},
	bannerTextFailed: {
		color: Colors.text.red,
	},
});

const BANNER_CONFIG: Record<
	BannerVariant,
	{
		icon: React.ComponentProps<typeof Feather>['name'];
		iconColor: string;
		container: object;
		text: object;
	}
> = {
	found: {
		icon: 'search',
		iconColor: Colors.text.primaryBrand,
		container: styles.bannerFound,
		text: styles.bannerTextFound,
	},
	review: {
		icon: 'alert-circle',
		iconColor: Colors.text.yellow,
		container: styles.bannerReview,
		text: styles.bannerTextReview,
	},
	failed: {
		icon: 'help-circle',
		iconColor: Colors.text.red,
		container: styles.bannerFailed,
		text: styles.bannerTextFailed,
	},
};

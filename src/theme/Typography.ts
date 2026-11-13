export const FontWeights = {
	light: '300',
	regular: '400',
	medium: '500',
	semibold: '600',
	bold: '700',
} as const;

export const FontSizes = {
	xxs: 10,
	xs: 12,
	sm: 14,
	md: 16,
	lg: 18,
	xl: 20,
	xxl: 24,
} as const;

/**
 * 한글 최적 행간 (1.4~1.5배)
 * FontSizes 키와 1:1 대응
 */
export const LineHeights = {
	xxs: 14,
	xs: 17,
	sm: 20,
	md: 24,
	lg: 26,
	xl: 28,
	xxl: 32,
} as const;

/**
 * 자간 — 큰 글자는 좁게, 작은 글자는 넓게
 */
export const LetterSpacing = {
	tight: -0.4,
	normal: 0,
	wide: 0.2,
} as const;

type TextVariantStyle = {
	fontSize: number;
	lineHeight: number;
	/** `Text`의 weight prop을 지정하지 않았을 때 쓰는 굵기 */
	defaultWeight: keyof typeof FontWeights;
};

/**
 * 텍스트 프리셋 — 크기와 행간을 정하고, 굵기는 `weight` prop으로 따로 정한다
 */
export const TextVariants = {
	/** 화면 대표 제목(온보딩 등) */
	display: { fontSize: FontSizes.xxl, lineHeight: LineHeights.xxl, defaultWeight: 'bold' },
	/** 화면 제목, 모달 제목 */
	title: { fontSize: FontSizes.xl, lineHeight: LineHeights.xl, defaultWeight: 'bold' },
	/** 섹션 제목 */
	heading: { fontSize: FontSizes.lg, lineHeight: LineHeights.lg, defaultWeight: 'semibold' },
	/** 본문 기본값 */
	body1: { fontSize: FontSizes.md, lineHeight: LineHeights.md, defaultWeight: 'regular' },
	/** 보조 본문, 리스트 부가 정보 */
	body2: { fontSize: FontSizes.sm, lineHeight: LineHeights.sm, defaultWeight: 'regular' },
	/** 시간, 메타 정보, 뱃지 */
	caption: { fontSize: FontSizes.xs, lineHeight: LineHeights.xs, defaultWeight: 'regular' },
	/** 탭 라벨, 카운트 */
	micro: { fontSize: FontSizes.xxs, lineHeight: LineHeights.xxs, defaultWeight: 'medium' },
} as const satisfies Record<string, TextVariantStyle>;

export type TextVariant = keyof typeof TextVariants;

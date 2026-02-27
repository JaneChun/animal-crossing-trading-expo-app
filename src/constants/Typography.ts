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

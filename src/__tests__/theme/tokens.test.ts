import { darkColors, lightColors } from '@/theme/Color';
import { Palette } from '@/theme/palette';
import { TextVariants } from '@/theme/Typography';

type Tokens = { [key: string]: string | Tokens };

/** 토큰 재정비(2026-11-11) 전 `Colors`의 값 */
const LEGACY_COLORS = {
	brand: { primary: '#35d8c9', secondary: '#e6f8f5' },
	text: {
		primary: '#050512',
		secondary: '#262634',
		tertiary: '#9797a0',
		inverse: '#FFFFFF',
		red: '#CD5067',
		orange: '#e47a41',
		yellow: '#DAA520',
		green: '#278734',
		blue: '#4e9eb6',
		lavender: '#5B5BDA',
		purple: '#B150CD',
		primaryBrand: '#06A98A',
	},
	bg: {
		primary: '#FFFFFF',
		secondary: '#F5F5F8',
		tertiary: '#eff0f4',
		inverse: '#000000',
		red: '#F6DBE0',
		orange: '#ffdfc9',
		yellow: '#FAF3E0',
		green: '#d6f3db',
		blue: '#d2f4ff',
		lavender: '#E6E6FA',
		purple: '#F0DBF6',
		primaryBrand: '#DBF6F1',
	},
	border: { default: '#eff0f4' },
	divider: { thick: '#e1e1e1' },
	icon: { default: '#bebed2', red: '#fb657e', green: '#50d086' },
	status: { error: '#E73B2A', success: '#2dcd6f', warning: '#FFA500' },
	overlay: { dim: 'rgba(0, 0, 0, 0.5)' },
	social: {
		naver: '#03C75A',
		naverText: '#FFFFFF',
		kakao: '#FEE500',
		kakaoText: '#3B1E1E',
		apple: '#ffffff',
		appleText: '#000000',
	},
};

const flatten = (tokens: Tokens, prefix = ''): Record<string, string> =>
	Object.entries(tokens).reduce<Record<string, string>>((flat, [key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		return typeof value === 'string'
			? { ...flat, [path]: value }
			: { ...flat, ...flatten(value, path) };
	}, {});

const normalize = (color: string) => color.toLowerCase();

describe('theme tokens', () => {
	const lightTokens = flatten(lightColors);
	const darkTokens = flatten(darkColors);

	it('lightColors와 darkColors의 키 구조가 같다', () => {
		expect(Object.keys(darkTokens).sort()).toEqual(Object.keys(lightTokens).sort());
	});

	it('라이트 값이 재정비 전 hex와 같다', () => {
		const legacyTokens = flatten(LEGACY_COLORS);

		Object.entries(legacyTokens).forEach(([path, legacyValue]) => {
			expect([path, normalize(lightTokens[path])]).toEqual([path, normalize(legacyValue)]);
		});
	});

	it('모든 TextVariants의 lineHeight가 fontSize 이상이다', () => {
		Object.values(TextVariants).forEach(({ fontSize, lineHeight }) => {
			expect(lineHeight).toBeGreaterThanOrEqual(fontSize);
		});
	});

	it('semantic 값은 모두 Palette 값 중 하나다', () => {
		const paletteValues = new Set(Object.values(flatten(Palette as unknown as Tokens)));
		const semanticValues = [...Object.values(lightTokens), ...Object.values(darkTokens)];

		semanticValues.forEach((value) => {
			expect(paletteValues).toContain(value);
		});
	});
});

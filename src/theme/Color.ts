import { Palette } from './palette';

export const lightColors = {
	// Brand colors
	brand: {
		primary: Palette.mint[400],
		secondary: Palette.mint[50],
	},

	// Text colors
	text: {
		primary: Palette.gray[900],
		secondary: Palette.gray[800],
		tertiary: Palette.gray[500],
		/** 테마의 반대색. 민트 면 위의 글자에는 `text.onBrand`를 쓴다 */
		inverse: Palette.gray[0],
		/** 민트 면(주 버튼, 보낸 말풍선) 위의 글자. 두 테마 모두 흰색 */
		onBrand: Palette.gray[0],
		red: Palette.red[800],
		orange: Palette.orange[500],
		yellow: Palette.yellow[500],
		green: Palette.green[700],
		blue: Palette.blue[500],
		lavender: Palette.lavender[600],
		purple: Palette.purple[500],
		primaryBrand: Palette.mint[600],
	},

	// Background colors
	bg: {
		primary: Palette.gray[0],
		secondary: Palette.gray[100],
		tertiary: Palette.gray[200],
		/** 바텀시트·모달·토스트처럼 화면 위에 떠 있는 면 */
		elevated: Palette.gray[0],
		/** 바탕 위에 놓인 입력칸·칩·카드 면. 시트 안에서는 `SheetThemeProvider`가 `fillOnElevated` 값으로 바꿔 준다 */
		fill: Palette.gray[100],
		/** 시트(`bg.elevated`) 위의 `bg.fill` 값. 화면 코드에서 직접 쓰지 않는다 */
		fillOnElevated: Palette.gray[100],
		/** `bg.secondary` 바탕 위에 올라온 면(받은 말풍선, 채팅 거래글 요약 카드) */
		raised: Palette.gray[0],
		inverse: Palette.gray[1000],
		red: Palette.red[50],
		orange: Palette.orange[50],
		yellow: Palette.yellow[50],
		green: Palette.green[50],
		blue: Palette.blue[50],
		lavender: Palette.lavender[50],
		purple: Palette.purple[50],
		primaryBrand: Palette.mint[100],
	},

	// Border colors
	border: {
		default: Palette.gray[200],
		/** `bg.fill` 면 안의 행 구분선. 다크에서는 화면 바탕색으로 그려 행 사이를 띄운다 */
		onFill: Palette.gray[200],
	},

	// Divider colors
	divider: {
		thick: Palette.gray[300],
	},

	// Icon colors
	icon: {
		default: Palette.gray[400],
		red: Palette.red[300],
		green: Palette.green[400],
	},

	// Status colors
	status: {
		error: Palette.red[700],
		success: Palette.green[500],
		warning: Palette.orange[400],
		danger: Palette.red[600],
		info: Palette.blue[400],
	},

	// Overlay colors
	overlay: {
		dim: Palette.blackAlpha[50],
	},

	// Media viewer colors — 사진 뷰어처럼 테마와 관계없이 검정 바탕을 쓰는 화면
	media: {
		background: Palette.gray[1000],
		foreground: Palette.gray[0],
	},

	// Skeleton colors
	skeleton: {
		/** 로딩 shimmer가 지나가는 밝은 부분. 바탕은 `bg.tertiary` */
		highlight: Palette.gray[50],
	},

	// Social login colors
	social: {
		naver: Palette.social.naver,
		naverText: Palette.gray[0],
		kakao: Palette.social.kakao,
		kakaoText: Palette.social.kakaoText,
		apple: Palette.gray[0],
		appleText: Palette.gray[1000],
		google: Palette.gray[0],
		googleText: Palette.social.googleText,
		googleBorder: Palette.social.googleBorder,
	},
} as const;

type ColorTokens<T> = {
	[K in keyof T]: T[K] extends string ? string : ColorTokens<T[K]>;
};

export type ColorScheme = ColorTokens<typeof lightColors>;

/** `text.{key}` 글자색과 `bg.{key}` 배경색이 짝지어진 tone 키 (Badge·SectionBanner) */
export type ToneColorKey = keyof ColorScheme['text'] & keyof ColorScheme['bg'];

export const darkColors: ColorScheme = {
	brand: {
		primary: Palette.mint[400],
		secondary: Palette.mint[950],
	},
	text: {
		primary: Palette.grayDark[50],
		secondary: Palette.grayDark[100],
		tertiary: Palette.grayDark[400],
		inverse: Palette.gray[900],
		onBrand: Palette.gray[0],
		red: Palette.red[200],
		orange: Palette.orange[300],
		yellow: Palette.yellow[300],
		green: Palette.green[200],
		blue: Palette.blue[300],
		lavender: Palette.lavender[300],
		purple: Palette.purple[300],
		primaryBrand: Palette.mint[400],
	},
	bg: {
		primary: Palette.grayDark[950],
		secondary: Palette.grayDark[900],
		tertiary: Palette.grayDark[800],
		elevated: Palette.grayDark[850],
		fill: Palette.grayDark[800],
		fillOnElevated: Palette.grayDark[725],
		raised: Palette.grayDark[725],
		inverse: Palette.gray[0],
		red: Palette.red[950],
		orange: Palette.orange[950],
		yellow: Palette.yellow[950],
		green: Palette.green[950],
		blue: Palette.blue[950],
		lavender: Palette.lavender[950],
		purple: Palette.purple[950],
		primaryBrand: Palette.mint[900],
	},
	border: {
		default: Palette.grayDark[750],
		onFill: Palette.grayDark[950],
	},
	divider: {
		thick: Palette.grayDark[700],
	},
	icon: {
		default: Palette.grayDark[600],
		red: Palette.red[300],
		green: Palette.green[400],
	},
	status: {
		error: Palette.red[400],
		success: Palette.green[300],
		warning: Palette.orange[200],
		danger: Palette.red[500],
		info: Palette.blue[400],
	},
	overlay: {
		dim: Palette.blackAlpha[60],
	},
	media: {
		background: Palette.gray[1000],
		foreground: Palette.gray[0],
	},
	skeleton: {
		highlight: Palette.grayDark[750],
	},
	social: {
		naver: Palette.social.naver,
		naverText: Palette.gray[0],
		kakao: Palette.social.kakao,
		kakaoText: Palette.social.kakaoText,
		apple: Palette.gray[0],
		appleText: Palette.gray[1000],
		google: Palette.gray[0],
		googleText: Palette.social.googleText,
		googleBorder: Palette.social.googleBorder,
	},
};

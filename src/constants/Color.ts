export const Colors = {
	base: '#F5F5F8',
	primary: '#35d8c9',

	//border
	border_gray: '#eff0f4',

	// font
	font_black: '#050512',
	font_dark_gray: '#262634',
	font_gray: '#9797a0',

	// icon정
	icon_gray: '#bebed2',
	icon_red: '#fb657e',
	icon_green: '#50d086',
	icon_primary: '#3AECDB',

	// button
	red_text: '#CD5067',
	red_background: '#F6DBE0',
	orange_text: '#e47a41',
	orange_background: '#ffdfc9',
	yellow_text: '#DAA520',
	yellow_background: '#FAF3E0',
	green_background: '#d6f3db',
	green_text: '#278734',
	primary_text: '#06A98A',
	primary_background: '#DBF6F1',
	blue_background: '#d2f4ff',
	blue_text: '#4e9eb6',
	lavendar_text: '#5B5BDA',
	lavendar_background: '#E6E6FA',
	purple_text: '#B150CD',
	purple_background: '#F0DBF6',
	naver: '#03C75A',
	kakao: '#FEE500',
	kakao_text: '#3B1E1E',
	apple: '#ffffff',
	apple_text: '#000000',

	// badge
	badge_red: '#ff3a30',
};

/**
 * Semantic Colors — 의미 기반 컬러 토큰
 * 기존 Colors의 값을 역할(role) 기준으로 재매핑
 *
 */
export const SemanticColors = {
	// 텍스트
	text: {
		primary: '#050512',
		secondary: '#262634',
		tertiary: '#9797a0',
		inverse: '#FFFFFF',
	},

	// 배경
	bg: {
		primary: '#FFFFFF',
		secondary: '#F5F5F8',
	},

	// 구분선
	divider: '#eff0f4',
	dividerThick: '#e1e1e1',

	// 상태
	error: '#E73B2A',
	success: '#2dcd6f',
	warning: '#FFA500',

	// 오버레이
	dim: 'rgba(0, 0, 0, 0.5)',
} as const;

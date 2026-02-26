import { ViewStyle } from 'react-native';

type ShadowStyle = Pick<
	ViewStyle,
	'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

/**
 * Shadow 프리셋
 */
export const Shadow: Record<'sm' | 'md', ShadowStyle> = {
	/** 가벼운 그림자 — 카드, 리스트 아이템 */
	sm: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 2,
		elevation: 2,
	},
	/** 중간 그림자 — 드롭다운, 플로팅 버튼 */
	md: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 4,
		elevation: 4,
	},
};

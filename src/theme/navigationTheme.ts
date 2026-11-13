import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';

import { darkColors } from './Color';
import { ThemeScheme } from './ThemeProvider';

/**
 * 라이트는 기존 화면을 유지하기 위해 React Navigation 기본 테마를 그대로 쓰고,
 * 다크만 우리 토큰으로 덮어쓴다.
 */
const darkNavigationTheme: NavigationTheme = {
	...DarkTheme,
	colors: {
		...DarkTheme.colors,
		primary: darkColors.brand.primary,
		background: darkColors.bg.primary,
		card: darkColors.bg.primary,
		text: darkColors.text.primary,
		border: darkColors.border.default,
		notification: darkColors.status.danger,
	},
};

export function getNavigationTheme(scheme: ThemeScheme): NavigationTheme {
	return scheme === 'dark' ? darkNavigationTheme : DefaultTheme;
}

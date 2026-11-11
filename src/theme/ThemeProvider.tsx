import { createContext, ReactNode, useContext } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

import { ColorScheme, darkColors, lightColors } from './Color';

/**
 * 다크 모드 활성화 플래그
 * 도메인 마이그레이션이 끝날 때까지 false로 두어 앱 화면을 라이트로 고정한다.
 */
export const DARK_MODE_ENABLED = false;

export type ThemeScheme = 'light' | 'dark';

export interface Theme {
	scheme: ThemeScheme;
	colors: ColorScheme;
}

const lightTheme: Theme = { scheme: 'light', colors: lightColors };
const darkTheme: Theme = { scheme: 'dark', colors: darkColors };

/** 플래그가 켜져 있고 기기 설정이 다크일 때만 dark, 그 외(설정 값 없음 포함)는 light */
export function resolveThemeScheme(
	deviceScheme: ColorSchemeName,
	darkModeEnabled: boolean,
): ThemeScheme {
	return darkModeEnabled && deviceScheme === 'dark' ? 'dark' : 'light';
}

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const deviceScheme = useColorScheme();
	const scheme = resolveThemeScheme(deviceScheme, DARK_MODE_ENABLED);
	const theme = scheme === 'dark' ? darkTheme : lightTheme;

	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
	return useContext(ThemeContext);
}

import { createContext, ReactNode, useContext } from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';

import { ColorScheme, darkColors, lightColors } from './Color';

/**
 * 다크 모드 활성화 플래그
 * false로 바꾸면 기기 설정과 관계없이 앱 화면을 라이트로 고정한다.
 */
export const DARK_MODE_ENABLED = true;

// 앱 화면만 라이트로 바꾸면 키보드·KeyboardToolbar·Alert 같은 네이티브 UI는 기기 설정을 따라 다크로 남는다.
// 앱 전체의 색 설정을 라이트로 덮어써서 네이티브 UI도 함께 라이트로 고정한다.
if (!DARK_MODE_ENABLED) {
	Appearance.setColorScheme('light');
}

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

/** 시트 면이 화면 바탕보다 밝아서, 시트 안에서는 `bg.fill`을 한 단계 밝은 `bg.fillOnElevated` 값으로 쓴다 */
function withSheetFill(theme: Theme): Theme {
	return {
		...theme,
		colors: {
			...theme.colors,
			bg: { ...theme.colors.bg, fill: theme.colors.bg.fillOnElevated },
		},
	};
}

const sheetThemes: Record<ThemeScheme, Theme> = {
	light: withSheetFill(lightTheme),
	dark: withSheetFill(darkTheme),
};

/** 바텀시트 안의 화면에 시트용 테마를 내려준다. `CustomBottomSheet`가 내용물을 감싼다 */
export function SheetThemeProvider({ children }: { children: ReactNode }) {
	const { scheme } = useTheme();

	return <ThemeContext.Provider value={sheetThemes[scheme]}>{children}</ThemeContext.Provider>;
}

import { useMemo } from 'react';

import { Theme, useTheme } from './ThemeProvider';

/**
 * 현재 테마로 스타일을 만든다. scheme이 바뀔 때만 다시 만든다.
 *
 * `makeStyles`는 컴포넌트 밖(모듈 최상단)에 정의해야 매 렌더마다 스타일을 다시 만들지 않는다.
 *
 * @example
 * const makeStyles = ({ colors }: Theme) =>
 * 	StyleSheet.create({ container: { backgroundColor: colors.bg.primary } });
 *
 * const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T>(makeStyles: (theme: Theme) => T): T {
	const theme = useTheme();

	return useMemo(() => makeStyles(theme), [makeStyles, theme]);
}

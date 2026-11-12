import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import { darkColors, lightColors } from '@/theme/Color';

import type { Theme } from '@/theme/ThemeProvider';

(
	globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean; React: typeof React }
).React = React;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
	true;

const mockUseColorScheme = jest.fn();

jest.mock('react-native', () => ({
	useColorScheme: () => mockUseColorScheme(),
}));

const {
	DARK_MODE_ENABLED,
	resolveThemeScheme,
	ThemeProvider,
	useTheme,
} = require('@/theme/ThemeProvider');
const { useThemedStyles } = require('@/theme/useThemedStyles');

describe('resolveThemeScheme', () => {
	it('플래그가 꺼져 있으면 기기가 다크여도 light다', () => {
		expect(resolveThemeScheme('dark', false)).toBe('light');
	});

	it('플래그가 켜져 있으면 기기 설정을 따른다', () => {
		expect(resolveThemeScheme('dark', true)).toBe('dark');
		expect(resolveThemeScheme('light', true)).toBe('light');
	});

	it('기기가 설정 값을 주지 않으면 light다', () => {
		expect(resolveThemeScheme('unspecified', true)).toBe('light');
	});
});

describe('ThemeProvider', () => {
	let renderer: ReactTestRenderer;

	afterEach(() => {
		act(() => renderer.unmount());
	});

	it('현재 플래그 값에 맞춰 기기 다크 설정을 반영한다', () => {
		mockUseColorScheme.mockReturnValue('dark');
		let theme: Theme | undefined;

		function Probe() {
			theme = useTheme();
			return null;
		}

		act(() => {
			renderer = create(
				<ThemeProvider>
					<Probe />
				</ThemeProvider>,
			);
		});

		expect(theme?.scheme).toBe(DARK_MODE_ENABLED ? 'dark' : 'light');
		expect(theme?.colors).toBe(DARK_MODE_ENABLED ? darkColors : lightColors);
	});

	it('같은 scheme에서는 useThemedStyles가 같은 객체를 반환한다', () => {
		mockUseColorScheme.mockReturnValue('light');
		const makeStyles = jest.fn(({ colors }: Theme) => ({
			container: { backgroundColor: colors.bg.primary },
		}));
		const results: ReturnType<typeof makeStyles>[] = [];

		function Probe() {
			results.push(useThemedStyles(makeStyles));
			return null;
		}

		act(() => {
			renderer = create(
				<ThemeProvider>
					<Probe />
				</ThemeProvider>,
			);
		});
		act(() => {
			renderer.update(
				<ThemeProvider>
					<Probe />
				</ThemeProvider>,
			);
		});

		expect(results).toHaveLength(2);
		expect(results[1]).toBe(results[0]);
		expect(makeStyles).toHaveBeenCalledTimes(1);
	});
});

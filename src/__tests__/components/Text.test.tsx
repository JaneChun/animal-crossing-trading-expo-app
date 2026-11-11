import React from 'react';
import { act, create, ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';

import { darkColors, lightColors } from '@/theme/Color';

import type { Theme } from '@/theme/ThemeProvider';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean; React: typeof React }).React =
	React;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
	true;

let mockTheme: Theme = { scheme: 'light', colors: lightColors };

jest.mock('react-native', () => ({
	Text: 'RNText',
}));

jest.mock('@/theme/ThemeProvider', () => ({
	useTheme: () => mockTheme,
}));

const Text = require('@/components/ui/Text').default;

type StyleValue = Record<string, unknown> | StyleValue[] | undefined | null | false;

const flattenStyle = (style: StyleValue): Record<string, unknown> =>
	Array.isArray(style)
		? style.reduce<Record<string, unknown>>(
				(merged, item) => ({ ...merged, ...flattenStyle(item) }),
				{},
			)
		: { ...(style || {}) };

const getStyles = (renderer: ReactTestRenderer) =>
	renderer.root
		.findAll((node: ReactTestInstance) => (node.type as unknown) === 'RNText')
		.map(node => flattenStyle(node.props.style));

describe('Text', () => {
	let renderer: ReactTestRenderer;

	const render = (element: React.ReactElement) => {
		act(() => {
			renderer = create(element);
		});
		return getStyles(renderer);
	};

	beforeEach(() => {
		mockTheme = { scheme: 'light', colors: lightColors };
	});

	afterEach(() => {
		act(() => renderer.unmount());
	});

	it('variant를 생략하면 body1 크기·행간과 regular 굵기, text.primary 색을 쓴다', () => {
		const [style] = render(<Text>본문</Text>);

		expect(style).toEqual({
			fontSize: 16,
			lineHeight: 24,
			fontWeight: '400',
			color: lightColors.text.primary,
		});
	});

	it('variant의 크기·행간과 기본 굵기를 쓴다', () => {
		const [style] = render(<Text variant="heading">제목</Text>);

		expect(style).toMatchObject({ fontSize: 18, lineHeight: 26, fontWeight: '600' });
	});

	it('weight prop이 variant의 기본 굵기보다 우선한다', () => {
		const [style] = render(
			<Text variant="title" weight="medium">
				제목
			</Text>,
		);

		expect(style.fontWeight).toBe('500');
	});

	it('color prop은 현재 테마의 text 색으로 바뀐다', () => {
		const [lightStyle] = render(<Text color="secondary">보조</Text>);
		act(() => renderer.unmount());

		mockTheme = { scheme: 'dark', colors: darkColors };
		const [darkStyle] = render(<Text color="secondary">보조</Text>);

		expect(lightStyle.color).toBe(lightColors.text.secondary);
		expect(darkStyle.color).toBe(darkColors.text.secondary);
	});

	it('style이 variant 스타일과 color prop보다 우선한다', () => {
		const [style] = render(
			<Text variant="caption" color="red" style={{ fontSize: 30, color: lightColors.text.blue }}>
				강조
			</Text>,
		);

		expect(style).toMatchObject({ fontSize: 30, color: lightColors.text.blue });
	});

	it('variant 없는 중첩 Text는 부모의 크기·행간·굵기·색을 덮어쓰지 않는다', () => {
		const [, nestedStyle] = render(
			<Text variant="title" color="secondary">
				앞 <Text style={{ color: lightColors.text.primaryBrand }}>강조</Text>
			</Text>,
		);

		expect(nestedStyle).toEqual({ color: lightColors.text.primaryBrand });
	});

	it('중첩 Text에 variant를 지정하면 그 크기·행간을 쓴다', () => {
		const [, nestedStyle] = render(
			<Text variant="title">
				앞 <Text variant="caption">작게</Text>
			</Text>,
		);

		expect(nestedStyle).toEqual({ fontSize: 12, lineHeight: 17, fontWeight: '400' });
	});
});

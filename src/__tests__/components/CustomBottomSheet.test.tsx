import React, { createElement } from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean; React: typeof React }).React =
	React;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
	true;

jest.mock('@gorhom/bottom-sheet', () => {
	const { createElement, forwardRef, useImperativeHandle } = require('react');

	const MockBottomSheet = (
		{ children, ...props }: { children: React.ReactNode },
		ref: React.ForwardedRef<object>,
	) => {
			useImperativeHandle(ref, () => ({ close: jest.fn(), snapToIndex: jest.fn() }));

			return createElement('BottomSheet', props, children);
	};
	const BottomSheet = forwardRef(MockBottomSheet);
	BottomSheet.displayName = 'MockBottomSheet';

	return {
		__esModule: true,
		default: BottomSheet,
		BottomSheetBackdrop: (props: object) => createElement('BottomSheetBackdrop', props),
	};
});

jest.mock('react-native', () => ({
	StyleSheet: {
		absoluteFillObject: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
		create: (styles: object) => styles,
	},
	Text: 'Text',
	View: 'View',
}));

jest.mock('react-native-keyboard-controller', () => ({
	useGenericKeyboardHandler: jest.fn(),
}));

jest.mock('react-native-reanimated', () => ({
	__esModule: true,
	default: { View: 'AnimatedView' },
	useAnimatedStyle: (factory: () => object) => factory(),
	useSharedValue: (value: number) => ({ value }),
}));

jest.mock('@/constants/keyboard', () => ({ KEYBOARD_TOOLBAR_HEIGHT: 50 }));
jest.mock('@/constants/Typography', () => ({
	FontSizes: { lg: 18 },
	FontWeights: { bold: '700' },
}));
jest.mock('@/theme/Color', () => ({
	Colors: {
		bg: { primary: 'white' },
		border: { default: 'gray' },
		icon: { default: 'gray' },
	},
}));

const CustomBottomSheet = require('@/components/ui/CustomBottomSheet').default;

describe('CustomBottomSheet', () => {
	const originalConsoleError = console.error;

	beforeAll(() => {
		jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
			if (
				message ===
				'react-test-renderer is deprecated. See https://react.dev/warnings/react-test-renderer'
			) {
				return;
			}

			originalConsoleError(message, ...args);
		});
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it('내부 콘텐츠를 바텀시트의 애니메이션 경계 안에 고정한다', () => {
		let renderer: ReactTestRenderer;

		act(() => {
			renderer = create(
				<CustomBottomSheet isVisible onClose={jest.fn()}>
					{createElement('View')}
				</CustomBottomSheet>,
			);
		});

		const content = renderer!.root.findByProps({ testID: 'customBottomSheetContent' });

		expect(content.props.style).toEqual(
			expect.objectContaining({
				position: 'absolute',
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
			}),
		);
	});
});

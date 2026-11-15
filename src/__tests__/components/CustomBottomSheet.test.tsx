import React, { act, createElement } from 'react';
import { create, ReactTestRenderer } from 'react-test-renderer';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean; React: typeof React }).React =
	React;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
	true;

// 컨테이너 아래쪽이 화면 끝에서 떨어진 거리(탭 화면이면 탭바 높이). 테스트마다 바꿔 쓴다
let mockContainerOffsetBottom = 0;
// 시트 윗변 위치·손잡이 높이·키보드 상태. 테스트마다 바꿔 쓴다
let mockAnimatedPosition = 40;
let mockHandleHeight = 24;
let mockKeyboard = { progress: 0, height: 0 };

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
		// 화면 높이 800 컨테이너에 ['95%', '100%'] 시트가 95%(위치 40)로 열린 상태
		useBottomSheetInternal: () => ({
			animatedLayoutState: {
				get: () => ({
					containerHeight: 800,
					handleHeight: mockHandleHeight,
					containerOffset: { bottom: mockContainerOffsetBottom },
				}),
			},
			animatedDetentsState: { get: () => ({ detents: [40, 0] }) },
			animatedPosition: { value: mockAnimatedPosition },
		}),
	};
});

const mockRemoveBackHandler = jest.fn();
const mockAddBackHandler = jest.fn(() => ({ remove: mockRemoveBackHandler }));

jest.mock('react-native', () => ({
	BackHandler: { addEventListener: mockAddBackHandler },
	StyleSheet: {
		absoluteFillObject: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
		create: (styles: object) => styles,
	},
	Text: 'Text',
	View: 'View',
}));

// 렌더링 중에 키보드 이벤트를 한 번 보내, 시트가 mockKeyboard 상태를 받은 것처럼 만든다
jest.mock('react-native-keyboard-controller', () => ({
	useGenericKeyboardHandler: (handlers: { onEnd: (event: object) => void }) =>
		handlers.onEnd(mockKeyboard),
}));

jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 48, left: 0 }),
}));

jest.mock('react-native-reanimated', () => ({
	__esModule: true,
	default: { View: 'AnimatedView' },
	useAnimatedStyle: (factory: () => object) => factory(),
	useSharedValue: (value: number) => ({ value }),
}));

jest.mock('@/constants/keyboard', () => ({ KEYBOARD_TOOLBAR_HEIGHT: 50 }));
jest.mock('@/theme/ThemeProvider', () => ({
	useTheme: () => ({ scheme: 'light', colors: jest.requireActual('@/theme/Color').lightColors }),
	SheetThemeProvider: ({ children }: { children: React.ReactNode }) => children,
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

	beforeEach(() => {
		mockAddBackHandler.mockClear();
		mockRemoveBackHandler.mockClear();
		mockContainerOffsetBottom = 0;
		mockAnimatedPosition = 40;
		mockHandleHeight = 24;
		mockKeyboard = { progress: 0, height: 0 };
	});

	const renderSheet = (props: { contentHandlesKeyboard?: boolean } = {}) => {
		let renderer: ReactTestRenderer;

		act(() => {
			renderer = create(
				<CustomBottomSheet isVisible onClose={jest.fn()} {...props}>
					{createElement('View')}
				</CustomBottomSheet>,
			);
		});

		return {
			contentStyle: renderer!.root.findByProps({ testID: 'customBottomSheetContent' }).props
				.style,
			bottomSpacerStyle: renderer!.root.findByProps({
				testID: 'customBottomSheetBottomSpacer',
			}).props.style,
		};
	};

	it('내부 콘텐츠 높이를 지금 화면에 보이는 시트 영역으로 맞춘다', () => {
		let renderer: ReactTestRenderer;

		act(() => {
			renderer = create(
				<CustomBottomSheet isVisible onClose={jest.fn()}>
					{createElement('View')}
				</CustomBottomSheet>,
			);
		});

		const content = renderer!.root.findByProps({ testID: 'customBottomSheetContent' });

		// Gorhom 내용 영역(가장 높은 스냅 포인트 기준 + 하단 패딩)을 그대로 채우면 시트 하단이 화면 밖으로 넘친다(#57)
		// 컨테이너 800 - 시트 위치 40 - 손잡이 24
		expect(content.props.style).toEqual({ height: 736 });
	});

	it('키보드가 없으면 하단 inset만큼 비워 내비게이션 바에 내용이 가려지지 않게 한다', () => {
		let renderer: ReactTestRenderer;

		act(() => {
			renderer = create(
				<CustomBottomSheet isVisible onClose={jest.fn()}>
					{createElement('View')}
				</CustomBottomSheet>,
			);
		});

		const bottomSpacer = renderer!.root.findByProps({ testID: 'customBottomSheetBottomSpacer' });

		expect(bottomSpacer.props.style).toEqual({ height: 48 });
	});

	it('탭바 위에서 끝나는 시트는 탭바가 덮는 inset만큼 덜 비운다', () => {
		mockContainerOffsetBottom = 30;
		let renderer: ReactTestRenderer;

		act(() => {
			renderer = create(
				<CustomBottomSheet isVisible onClose={jest.fn()}>
					{createElement('View')}
				</CustomBottomSheet>,
			);
		});

		const bottomSpacer = renderer!.root.findByProps({ testID: 'customBottomSheetBottomSpacer' });

		expect(bottomSpacer.props.style).toEqual({ height: 18 });
	});

	it('키보드가 시트 아래쪽을 덮은 만큼 내용 높이를 줄이고, 툴바 높이만큼 비운다', () => {
		mockKeyboard = { progress: 1, height: 300 };

		const { contentStyle, bottomSpacerStyle } = renderSheet();

		// 컨테이너 800 - 시트 위치 40 - 손잡이 24 - 키보드 300
		expect(contentStyle).toEqual({ height: 436 });
		expect(bottomSpacerStyle).toEqual({ height: 50 });
	});

	it('탭바 위에서 끝나는 시트는 탭바 높이만큼은 키보드가 덮지 않은 것으로 본다', () => {
		mockContainerOffsetBottom = 30;
		mockKeyboard = { progress: 1, height: 300 };

		const { contentStyle } = renderSheet();

		// 컨테이너 800 - 시트 위치 40 - 손잡이 24 - (키보드 300 - 탭바 30)
		expect(contentStyle).toEqual({ height: 466 });
	});

	it('contentHandlesKeyboard면 키보드가 있어도 내용 높이를 줄이지 않는다', () => {
		mockKeyboard = { progress: 1, height: 300 };

		const { contentStyle } = renderSheet({ contentHandlesKeyboard: true });

		// 키보드 여백은 KeyboardAwareScrollView가 넣으므로 시트가 또 줄이면 여백이 두 번 생긴다
		expect(contentStyle).toEqual({ height: 736 });
	});

	it('닫히며 내려가는 동안에는 가장 낮은 스냅 포인트 기준 높이를 유지한다', () => {
		mockAnimatedPosition = 600;

		const { contentStyle } = renderSheet();

		// 시트 위치를 가장 낮은 스냅 포인트(40)로 고정: 800 - 40 - 24
		expect(contentStyle).toEqual({ height: 736 });
	});

	it('손잡이 높이를 아직 재지 않았으면(Gorhom 초기값 -999) 0으로 본다', () => {
		mockHandleHeight = -999;

		const { contentStyle } = renderSheet();

		// 800 - 40 - 0
		expect(contentStyle).toEqual({ height: 760 });
	});

	it('열려 있는 동안 Android 뒤로가기를 가로채 시트를 닫는다', () => {
		const onClose = jest.fn();
		let renderer: ReactTestRenderer;

		act(() => {
			renderer = create(
				<CustomBottomSheet isVisible onClose={onClose}>
					{createElement('View')}
				</CustomBottomSheet>,
			);
		});

		expect(mockAddBackHandler).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));

		const handleBackPress = (mockAddBackHandler.mock.calls[0] as unknown[])[1] as () => boolean;
		expect(handleBackPress()).toBe(true);
		expect(onClose).toHaveBeenCalledTimes(1);

		act(() => {
			renderer!.unmount();
		});

		expect(mockRemoveBackHandler).toHaveBeenCalled();
	});

	it('닫혀 있을 때는 뒤로가기를 가로채지 않는다', () => {
		act(() => {
			create(
				<CustomBottomSheet isVisible={false} onClose={jest.fn()}>
					{createElement('View')}
				</CustomBottomSheet>,
			);
		});

		expect(mockAddBackHandler).not.toHaveBeenCalled();
	});
});

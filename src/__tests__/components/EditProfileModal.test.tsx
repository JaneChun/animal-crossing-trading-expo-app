import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean; React: typeof React }).React =
	React;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
	true;

jest.mock('@expo/vector-icons', () => ({
	FontAwesome: 'FontAwesome',
}));

jest.mock('@gorhom/bottom-sheet', () => {
	const { createElement } = require('react');

	return {
		BottomSheetScrollView: ({ children, ...props }: { children: React.ReactNode }) =>
			createElement('BottomSheetScrollView', props, children),
		BottomSheetTextInput: (props: object) =>
			createElement('BottomSheetTextInput', { ...props, isBottomSheetTextInput: true }),
	};
});

jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => {
	const { createContext } = require('react');
	// 컨텍스트 기본값을 80으로 두면 Provider 없이도 "탭 안(높이 80)" 상황이 재현된다.
	return {
		BottomTabBarHeightContext: createContext(80),
	};
});

jest.mock('react-native-keyboard-controller', () => {
	const { createElement } = require('react');

	return {
		// 실제 컴포넌트처럼 나머지 props(testID·bottomOffset·contentContainerStyle 등)를
		// ScrollViewComponent로 그대로 전달해, 포커스 자동 스크롤 설정을 검증할 수 있게 한다.
		KeyboardAwareScrollView: ({
			children,
			ScrollViewComponent,
			...props
		}: {
			children: React.ReactNode;
			ScrollViewComponent?: React.ElementType;
		}) => createElement(ScrollViewComponent ?? 'ScrollView', props, children),
	};
});

jest.mock('react-hook-form', () => {
	const React = require('react');

	return {
		Controller: ({ render }: { render: (props: object) => React.ReactNode }) =>
			render({ field: { value: '', onChange: jest.fn() } }),
		FormProvider: ({ children }: { children: React.ReactNode }) => children,
	};
});

jest.mock('react-native', () => ({
	Image: 'Image',
	StyleSheet: { create: (styles: object) => styles },
	Text: 'Text',
	TextInput: 'TextInput',
	TouchableOpacity: 'TouchableOpacity',
	View: 'View',
}));

jest.mock('@/components/Profile/ProfileImageInput', () => 'ProfileImageInput');
jest.mock('@/components/ui/Button', () => 'Button');
jest.mock('@/components/ui/CustomBottomSheet', () => {
	const { createElement } = require('react');

	const MockCustomBottomSheet = ({
		children,
		...props
	}: {
		children: React.ReactNode;
		snapPoints?: string[];
	}) => createElement('CustomBottomSheet', { ...props, testID: 'customBottomSheet' }, children);
	MockCustomBottomSheet.displayName = 'MockCustomBottomSheet';

	return MockCustomBottomSheet;
});
jest.mock('@/components/ui/loading/LoadingIndicator', () => 'LoadingIndicator');
jest.mock('@/components/ui/Toast', () => ({ showToast: jest.fn() }));
jest.mock('@/components/Profile/NameInput', () => {
	const { createElement } = require('react');

	const DefaultInput = (props: object) => createElement('TextInput', props);
	const MockNameInput = ({
		InputComponent = DefaultInput,
		type,
	}: {
		InputComponent?: React.ElementType;
		type: string;
	}) => createElement(InputComponent, { testID: `${type}Input` });
	MockNameInput.displayName = 'MockNameInput';

	return MockNameInput;
});
jest.mock('@/components/ui/ErrorMessage', () => 'ErrorMessage');

jest.mock('@/constants/profile', () => ({ FRUIT_IMAGES: {} }));
jest.mock('@/firebase/core/firestoreService', () => ({ updateDocToFirestore: jest.fn() }));
jest.mock('@/firebase/services/imageService', () => ({
	checkIfObjectExistsInStorage: jest.fn(),
	deleteObjectFromStorage: jest.fn(),
	uploadObjectToStorage: jest.fn(),
}));
jest.mock('@/hooks/profile/form/useProfileForm', () => ({
	useProfileForm: () => ({
		control: {},
		watch: () => '',
		setValue: jest.fn(),
		handleSubmit: jest.fn(),
		reset: jest.fn(),
		formState: { errors: {} },
	}),
}));
jest.mock('@/stores/auth', () => ({
	useAuthStore: () => jest.fn(),
	useUserInfo: () => null,
}));
jest.mock('@/utilities/analytics', () => ({ logProfileUpdate: jest.fn() }));

const EditProfileModal = require('@/components/Profile/EditProfileModal').default;

describe('EditProfileModal', () => {
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

	const renderModal = () => {
		let renderer: ReactTestRenderer;

		act(() => {
			renderer = create(
				<EditProfileModal
					isVisible
					onClose={jest.fn()}
					isUploading={false}
					setIsUploading={jest.fn()}
				/>,
			);
		});

		return renderer!;
	};

	it('바텀시트 전용 스크롤 영역에 전체 콘텐츠와 하단 여백을 둔다', () => {
		const renderer = renderModal();

		const scrollView = renderer.root.findByProps({ testID: 'editProfileScrollView' });
		const content = renderer.root.findByProps({ testID: 'editProfileContent' });
		const info = renderer.root.findByProps({ testID: 'editProfileInfo' });
		const contentContainerStyle = Object.assign(
			{},
			...(Array.isArray(scrollView.props.contentContainerStyle)
				? scrollView.props.contentContainerStyle
				: [scrollView.props.contentContainerStyle]),
		);

		expect(contentContainerStyle.paddingBottom).toBe(24);
		expect(contentContainerStyle).not.toEqual(expect.objectContaining({ flexGrow: 1 }));
		expect(content.props.style).not.toEqual(expect.objectContaining({ flex: 1 }));
		expect(content.props.style.flexShrink).toBe(0);
		expect(info.props.style.flexShrink).toBe(0);

		const bottomSheet = renderer.root.findByProps({ testID: 'customBottomSheet' });
		const bodyStyle = Object.assign(
			{},
			...(Array.isArray(bottomSheet.props.bodyStyle)
				? bottomSheet.props.bodyStyle
				: [bottomSheet.props.bodyStyle]),
		);

		expect(bodyStyle.paddingBottom).toBe(80);
		expect(bottomSheet.props.bottomInset).toBeUndefined();
		expect(bottomSheet.props.enableContentPanningGesture).toBeUndefined();
	});

	it('바텀 시트가 95%/100% 스냅 포인트를 사용한다', () => {
		const renderer = renderModal();

		const bottomSheet = renderer.root.findByProps({ testID: 'customBottomSheet' });

		expect(bottomSheet.props.snapPoints).toEqual(['95%', '100%']);
	});

	it('포커스된 입력이 키보드 위로 자동 스크롤되도록 툴바+여백만큼 bottomOffset을 설정한다', () => {
		const renderer = renderModal();

		const scrollView = renderer.root.findByProps({ testID: 'editProfileScrollView' });
		const contentContainerStyle = Object.assign(
			{},
			...(Array.isArray(scrollView.props.contentContainerStyle)
				? scrollView.props.contentContainerStyle
				: [scrollView.props.contentContainerStyle]),
		);

		// KEYBOARD_TOOLBAR_HEIGHT(50) + PADDING(24)
		expect(scrollView.props.bottomOffset).toBe(74);
		// 키보드 보정은 KeyboardAwareScrollView가 전담하므로 하단 패딩은 키보드 높이에
		// 무관한 정적 값이어야 한다(이중 여백 방지).
		expect(contentContainerStyle.paddingBottom).toBe(24);
	});

	it('모든 프로필 입력을 바텀시트 키보드 처리에 등록한다', () => {
		const renderer = renderModal();

		expect(renderer.root.findAll((node) => node.props.isBottomSheetTextInput)).toHaveLength(5);
	});
});

import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetProps,
	useBottomSheetInternal,
} from '@gorhom/bottom-sheet';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { BackHandler, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useGenericKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KEYBOARD_TOOLBAR_HEIGHT } from '@/constants/keyboard';
import {
	BorderRadius,
	SheetThemeProvider,
	Spacing,
	Theme,
	useTheme,
	useThemedStyles,
} from '@/theme';

import Text from './Text';

const CustomBottomSheet = ({
	children,
	isVisible,
	snapPoints = ['50%'],
	title,
	leftButton,
	rightButton,
	bodyStyle = {},
	keyboardBehavior,
	contentHandlesKeyboard = false,
	onClose,
}: {
	children: ReactNode;
	isVisible: boolean;
	snapPoints?: string[];
	title?: string;
	leftButton?: ReactNode;
	rightButton?: ReactNode;
	bodyStyle?: StyleProp<ViewStyle>;
	keyboardBehavior?: BottomSheetProps['keyboardBehavior'];
	// true면 키보드가 덮는 만큼 내용 높이를 줄이지 않는다.
	// KeyboardAwareScrollView처럼 키보드 높이만큼 스스로 여백을 넣는 내용에 쓴다(줄이면 여백이 두 번 생긴다).
	contentHandlesKeyboard?: boolean;
	onClose: () => void;
}) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const keyboardProgress = useSharedValue(0);
	const keyboardHeight = useSharedValue(0);

	useGenericKeyboardHandler(
		{
			onMove: (event) => {
				'worklet'; // UI 스레드에서 실행
				keyboardProgress.value = event.progress; // event.progress: 0~1
				keyboardHeight.value = event.height;
			},
			onEnd: (event) => {
				'worklet';
				keyboardProgress.value = event.progress;
				keyboardHeight.value = event.height;
			},
		},
		[],
	);

	useEffect(() => {
		if (isVisible) {
			bottomSheetRef.current?.snapToIndex(0);
		} else {
			bottomSheetRef.current?.close();
		}
	}, [isVisible]);

	// Android 뒤로가기: 시트가 열려 있는 동안에는 화면 이동 대신 시트만 닫는다
	useEffect(() => {
		if (!isVisible) return;

		const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
			onClose();
			return true;
		});
		return () => subscription.remove();
	}, [isVisible, onClose]);

	const handleSheetChanges = useCallback(
		(index: number) => {
			if (index === -1) {
				onClose();
			}
		},
		[onClose],
	);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior="close"
			/>
		),
		[],
	);

	return (
		<BottomSheet
			style={styles.screen}
			ref={bottomSheetRef}
			index={isVisible ? 0 : -1} // -1 (닫힘)
			enableDynamicSizing={false}
			// 시트 높이를 정하는 방식 스위치.
			// - true(기본값): 안쪽 콘텐츠 높이를 측정해 그 값으로 시트 높이를 맞춘다.
			// - false: 측정하지 않고 snapPoints에 준 값('95%')을 시트 높이로 쓴다.
			// 아래 content는 BottomSheetView가 아닌 일반 View라 Gorhom이 높이를 측정하지 못한다.
			// 따라서 false여야 한다. true면 측정이 끝나지 않아 시트가 열리지 않는다.
			snapPoints={snapPoints}
			onChange={handleSheetChanges}
			// 기본값 'none'은 키보드가 내려가도 시트를 키보드 위치에 둔다. 'restore'로 원래 스냅 포인트로 되돌린다
			keyboardBlurBehavior="restore"
			keyboardBehavior={keyboardBehavior}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			backgroundStyle={{
				backgroundColor: colors.bg.elevated,
				borderTopLeftRadius: BorderRadius.l,
				borderTopRightRadius: BorderRadius.l,
			}}
			handleIndicatorStyle={{ width: 60, backgroundColor: colors.icon.default }}
		>
			<SheetContent
				keyboardProgress={keyboardProgress}
				keyboardHeight={keyboardHeight}
				contentHandlesKeyboard={contentHandlesKeyboard}
			>
				{title && (
					<View style={styles.header}>
						{/* 제목이 헤더 전체 너비를 덮으므로, 버튼은 제목보다 나중에 그려야 위에 올라와 탭을 받는다 */}
						<Text variant="heading" weight="bold" style={styles.title}>
							{title}
						</Text>
						{leftButton && (
							<View style={[styles.headerButton, { left: 0 }]}>{leftButton}</View>
						)}
						{rightButton && (
							<View style={[styles.headerButton, { right: 0 }]}>{rightButton}</View>
						)}
					</View>
				)}
				<View style={[styles.body, bodyStyle]}>
					<SheetThemeProvider>{children}</SheetThemeProvider>
				</View>
			</SheetContent>
		</BottomSheet>
	);
};

export default CustomBottomSheet;

/*
 * 시트 내용의 루트. 높이를 "지금 화면에 보이는 시트 영역"으로 직접 계산해 지정한다.
 * Gorhom의 내용 영역은 가장 높은 스냅 포인트 기준 높이에 하단 패딩(드래그 여유·키보드)을 더한 크기라,
 * 그 영역을 그대로 채우면 ['95%', '100%'] 시트가 95%에 있을 때나 패딩만큼 내용 아래쪽이 화면 밖으로 나간다(#57).
 * Android에서는 이 영역이 내용 크기에 따라 더 늘어나기도 해서, flex:1·absoluteFill로는 높이를 묶을 수 없다.
 * Gorhom 내부 상태를 읽어야 하므로 BottomSheet 자식으로 렌더링한다.
 */
const SheetContent = ({
	keyboardProgress,
	keyboardHeight,
	contentHandlesKeyboard,
	children,
}: {
	keyboardProgress: SharedValue<number>;
	keyboardHeight: SharedValue<number>;
	contentHandlesKeyboard: boolean;
	children: ReactNode;
}) => {
	const { bottom: bottomInset } = useSafeAreaInsets();
	const { animatedLayoutState, animatedPosition, animatedDetentsState } =
		useBottomSheetInternal();

	const contentStyle = useAnimatedStyle(() => {
		const { containerHeight, handleHeight, containerOffset } = animatedLayoutState.get();
		const { detents } = animatedDetentsState.get();
		const lowestOpenDetentPosition = detents?.length ? Math.max(...detents) : containerHeight;

		// containerHeight - sheetTop: 지금 보이는 시트의 높이
		// 시트가 닫히며 내려가는 동안 animatedPosition은 계속 커지므로, 컨텐츠가 줄어들지 않게 가장 낮은 스냅 포인트에서 높이를 고정
		const sheetTop = Math.min(animatedPosition.value, lowestOpenDetentPosition);

		// 키보드가 시트 아래쪽을 덮은 만큼 뺀다. 
		// 컨테이너가 화면 끝보다 위에서 끝나면(탭바 위 등) 그만큼은 덮지 않는다.
		const keyboardOverlap = contentHandlesKeyboard
			? 0
			: Math.max(0, keyboardHeight.value - containerOffset.bottom);

		// 손잡이 높이를 아직 재지 않았으면 Gorhom이 초기값(-999)을 두므로 0으로 본다
		const measuredHandleHeight = Math.max(0, handleHeight);

		return {
			height: Math.max(
				0,
				containerHeight - sheetTop - measuredHandleHeight - keyboardOverlap,
			),
		};
	});

	// 맨 아래를 비워 내용이 가려지지 않게 한다.
	// 키보드가 없으면 Android 내비게이션 바·iPhone 홈 인디케이터(insets.bottom)만큼 비우되,
	// 컨테이너가 화면 끝보다 위에서 끝나면(탭바 위) 그만큼은 이미 가려지지 않으므로 뺀다.
	// 키보드가 있으면 키보드 위 툴바(KEYBOARD_TOOLBAR_HEIGHT)만큼 비운다.
	const bottomSpacerStyle = useAnimatedStyle(() => {
		const { containerOffset } = animatedLayoutState.get();
		// 내비게이션 바·홈 인디케이터가 시트 아래쪽을 덮는 높이
		const bottomInsetOverlap = Math.max(0, bottomInset - containerOffset.bottom);

		return {
			height:
				keyboardProgress.value * KEYBOARD_TOOLBAR_HEIGHT +
				(1 - keyboardProgress.value) * bottomInsetOverlap,
		};
	});

	return (
		<Animated.View testID="customBottomSheetContent" style={contentStyle}>
			{children}
			<Animated.View
				testID="customBottomSheetBottomSpacer"
				pointerEvents="none"
				style={bottomSpacerStyle}
			/>
		</Animated.View>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
		},
		header: {
			position: 'relative',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			borderBottomWidth: 1,
			borderColor: colors.border.default,
			paddingTop: Spacing.xl,
			paddingBottom: Spacing.l,
			marginHorizontal: Spacing.m,
		},
		headerButton: {
			position: 'absolute',
		},
		title: {
			flex: 1,
			textAlign: 'center',
		},
		body: {
			flex: 1,
			padding: Spacing.xxxl,
		},
	});

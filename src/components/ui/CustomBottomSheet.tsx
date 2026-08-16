import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useGenericKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { KEYBOARD_TOOLBAR_HEIGHT } from '@/constants/keyboard';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';

const CustomBottomSheet = ({
	children,
	isVisible,
	snapPoints = ['50%'],
	title,
	leftButton,
	rightButton,
	bodyStyle = {},
	onClose,
}: {
	children: ReactNode;
	isVisible: boolean;
	snapPoints?: string[];
	title?: string;
	leftButton?: ReactNode;
	rightButton?: ReactNode;
	bodyStyle?: StyleProp<ViewStyle>;
	onClose: () => void;
}) => {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const keyboardProgress = useSharedValue(0);

	useGenericKeyboardHandler(
		{
			onMove: (event) => {
				'worklet'; // UI 스레드에서 실행
				keyboardProgress.value = event.progress; // event.progress: 0~1
			},
			onEnd: (event) => {
				'worklet';
				keyboardProgress.value = event.progress;
			},
		},
		[],
	);

	const keyboardToolbarSpacerStyle = useAnimatedStyle(() => ({
		height: keyboardProgress.value * KEYBOARD_TOOLBAR_HEIGHT,
	}));

	useEffect(() => {
		if (isVisible) {
			bottomSheetRef.current?.snapToIndex(0);
		} else {
			bottomSheetRef.current?.close();
		}
	}, [isVisible]);

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
			// 아래 content는 absoluteFillObject(절대 위치)라 높이 측정에서 제외돼 측정값이 0이다.
			// 따라서 false여야 한다. true면 "콘텐츠 높이 0" → 시트가 높이 0으로 닫힌다.
			snapPoints={snapPoints}
			onChange={handleSheetChanges}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			backgroundStyle={{
				backgroundColor: Colors.bg.primary,
				borderTopLeftRadius: 16,
				borderTopRightRadius: 16,
			}}
			handleIndicatorStyle={{ width: 60, backgroundColor: Colors.icon.default }}
		>
			{/*
			 * Gorhom은 시트 높이를 애니메이션으로 계산해 flex:1 자식이 높이 제약을 못 받는다.
			 * 내부 루트를 absoluteFillObject로 부모 경계에 고정해야 스크롤 뷰포트가 실제 시트 높이를
			 * 따른다. (enableDynamicSizing={false}가 전제)
			 */}
			<View testID="customBottomSheetContent" style={styles.content}>
				{title && (
					<View style={styles.header}>
						{leftButton && (
							<View style={[styles.headerButton, { left: 0 }]}>{leftButton}</View>
						)}
						<Text style={styles.title}>{title}</Text>
						{rightButton && (
							<View style={[styles.headerButton, { right: 0 }]}>{rightButton}</View>
						)}
					</View>
				)}
				<View style={[styles.body, bodyStyle]}>{children}</View>
				<Animated.View pointerEvents="none" style={keyboardToolbarSpacerStyle} />
			</View>
		</BottomSheet>
	);
};

export default CustomBottomSheet;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	content: {
		...StyleSheet.absoluteFillObject,
	},
	header: {
		position: 'relative',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: Colors.border.default,
		paddingTop: 20,
		paddingBottom: 16,
		marginHorizontal: 12,
	},
	headerButton: {
		position: 'absolute',
	},
	title: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.bold,
		flex: 1,
		textAlign: 'center',
	},
	body: {
		flex: 1,
		padding: 30,
	},
});

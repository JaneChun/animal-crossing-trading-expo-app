import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

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
			 * v5의 BottomSheetView는 dynamic sizing 측정용 절대배치 뷰라 flex 체인이 끊김 → 일반 View 사용.
			 * 단, View는 콘텐츠 높이를 측정해주지 않으므로 enableDynamicSizing={false}가 전제 조건.
			 * (dynamic sizing을 다시 켜면 detent 계산이 끝나지 않아 시트가 열리지 않음)
			 */}
			<View style={styles.screen}>
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
			</View>
		</BottomSheet>
	);
};

export default CustomBottomSheet;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
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

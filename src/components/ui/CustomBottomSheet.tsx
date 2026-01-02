import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import React, { ReactNode, useCallback, useMemo, useRef } from 'react';
import {
	StyleProp,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
	ViewStyle,
} from 'react-native';

const CustomBottomSheet = ({
	children,
	isVisible,
	heightRatio = 0.5,
	title,
	leftButton,
	rightButton,
	bodyStyle = {},
	onClose,
}: {
	children: ReactNode;
	isVisible: boolean;
	heightRatio?: number;
	title?: string;
	leftButton?: ReactNode;
	rightButton?: ReactNode;
	bodyStyle?: StyleProp<ViewStyle>;
	onClose: () => void;
}) => {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const { height: screenHeight } = useWindowDimensions();
	const headerHeight = useHeaderHeight();

	const snapPoints = useMemo(() => [`${heightRatio * 100}`], [heightRatio]);

	const handleSheetChanges = useCallback(
		(index: number) => {
			if (index === -1) {
				onClose();
			}
		},
		[onClose],
	);

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior='close'
			/>
		),
		[],
	);

	return (
		<BottomSheet
			style={styles.screen}
			ref={bottomSheetRef}
			index={isVisible ? 0 : -1} // -1 (닫힘)
			snapPoints={snapPoints}
			onChange={handleSheetChanges}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			backgroundStyle={{
				backgroundColor: 'white',
				borderTopLeftRadius: 16,
				borderTopRightRadius: 16,
			}}
			handleIndicatorStyle={{ width: 60, backgroundColor: Colors.icon_gray }}
		>
			<BottomSheetView style={styles.screen}>
				{title && (
					<View style={styles.header}>
						{leftButton && (
							<View style={[styles.headerButton, { left: 0 }]}>
								{leftButton}
							</View>
						)}
						<Text style={styles.title}>{title}</Text>
						{rightButton && (
							<View style={[styles.headerButton, { right: 0 }]}>
								{rightButton}
							</View>
						)}
					</View>
				)}
				<View
					style={[
						styles.body,
						{
							height: (screenHeight - headerHeight) * heightRatio,
						},
						bodyStyle,
					]}
				>
					{children}
				</View>
			</BottomSheetView>
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
		borderColor: Colors.border_gray,
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
		padding: 30,
		flex: 1,
	},
});

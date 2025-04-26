import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { ReactNode, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const CustomBottomSheet = ({
	children,
	isVisible,
	modalHeight = '50%',
	title,
	leftButton,
	rightButton,
	onClose,
}: {
	children: ReactNode;
	isVisible: boolean;
	modalHeight: string; // "00%"
	title?: string;
	leftButton?: ReactNode;
	rightButton?: ReactNode;
	onClose: () => void;
}) => {
	const bottomSheetRef = useRef<BottomSheet>(null);

	const snapPoints = useMemo(() => [modalHeight], [modalHeight]);

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
			<BottomSheetView style={styles.content}>
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
				<View style={styles.body} pointerEvents='box-none'>
					{children}
					{/* <Toast config={toastConfig} /> */}
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
};

export default CustomBottomSheet;

const styles = StyleSheet.create({
	content: {
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

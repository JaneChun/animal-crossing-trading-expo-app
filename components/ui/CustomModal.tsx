import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { toastConfig } from './Toast';

const CustomModal = ({
	children,
	isVisible,
	modalHeight = '50%',
	title,
	leftButton,
	rightButton,
	avoidKeyboard = false,
	onClose,
}: {
	children: ReactNode;
	isVisible: boolean;
	modalHeight?: number | string;
	title?: string;
	leftButton?: ReactNode;
	rightButton?: ReactNode;
	avoidKeyboard?: boolean;
	onClose: () => void;
}) => {
	const computedHeight: ViewStyle = {
		height:
			typeof modalHeight === 'string'
				? `${parseFloat(modalHeight)}%`
				: modalHeight,
	};

	return (
		<Modal
			isVisible={isVisible}
			onBackdropPress={onClose}
			backdropOpacity={0.5}
			avoidKeyboard={avoidKeyboard}
			animationIn='slideInUp'
			animationOut='slideOutDown'
			onSwipeComplete={onClose}
			swipeDirection='down'
			style={styles.screen}
		>
			<View style={[styles.modal, computedHeight]}>
				{title && (
					<View style={styles.header}>
						{leftButton && (
							<View style={[styles.headerButton, { left: 0 }]}>
								{leftButton}
							</View>
						)}
						<Text style={styles.title}>프로필 수정</Text>
						{rightButton && (
							<View style={[styles.headerButton, { right: 0 }]}>
								{rightButton}
							</View>
						)}
					</View>
				)}
				<View style={styles.body}>
					{children}
					<Toast config={toastConfig} />
				</View>
			</View>
		</Modal>
	);
};

export default CustomModal;

const styles = StyleSheet.create({
	screen: {
		justifyContent: 'flex-end',
		margin: 0,
	},
	modal: {
		backgroundColor: 'white',
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
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

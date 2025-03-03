import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { toastConfig } from './Toast';

const CustomModal = ({
	children,
	isVisible,
	modalHeight = '50%',
	avoidKeyboard = false,
	onClose,
}: {
	children: ReactNode;
	isVisible: boolean;
	modalHeight?: number | string;
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
				{children}
				<Toast config={toastConfig} />
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
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 30,
	},
});

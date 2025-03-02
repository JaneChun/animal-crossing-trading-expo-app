import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';

const CustomModal = ({
	children,
	modalHeight = '50%',
	isVisible,
	onClose,
}: {
	children: ReactNode;
	modalHeight?: number | string;
	isVisible: boolean;
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
			avoidKeyboard={true}
			style={styles.screen}
		>
			<View style={[styles.modal, computedHeight]}>{children}</View>
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

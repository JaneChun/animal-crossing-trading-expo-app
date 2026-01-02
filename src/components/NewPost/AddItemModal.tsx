import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { AddItemModalProps } from '@/types/components';
import React from 'react';
import ItemSelect from './ItemSelect';

const AddItemModal = ({
	cart,
	addItemToCart,
	isVisible,
	onClose,
}: AddItemModalProps) => {
	return (
		<CustomBottomSheet
			isVisible={isVisible}
			onClose={onClose}
			heightRatio={0.95}
		>
			<ItemSelect cart={cart} addItemToCart={addItemToCart} />
		</CustomBottomSheet>
	);
};

export default AddItemModal;

import ItemSelect from '@/components/NewPost/ItemSelect';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { AddItemModalProps } from '@/types/components';
import React from 'react';

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
			modalHeight='97%'
		>
			<ItemSelect cart={cart} addItemToCart={addItemToCart} />
		</CustomBottomSheet>
	);
};

export default AddItemModal;

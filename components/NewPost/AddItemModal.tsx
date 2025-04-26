import ItemSelect from '@/components/NewPost/ItemSelect';
import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { CartItem } from '@/types/post';
import React, { Dispatch, SetStateAction, useState } from 'react';

const AddItemModal = ({
	cart,
	setCart,
	isVisible,
	onClose,
}: {
	cart: CartItem[];
	setCart: Dispatch<SetStateAction<CartItem[]>>;
	isVisible: boolean;
	onClose: () => void;
}) => {
	const [localCart, setLocalCart] = useState<CartItem[]>(cart);

	const onSubmit = () => {
		setCart(localCart);
		onClose();
	};

	return (
		<CustomBottomSheet
			isVisible={isVisible}
			onClose={onClose}
			modalHeight='97%'
		>
			<ItemSelect cart={localCart} setCart={setLocalCart} />
			<Button
				color='mint'
				size='lg2'
				onPress={onSubmit}
				style={{ marginTop: 16 }}
			>
				{localCart.length === 0 ? '추가' : `${localCart.length}개 추가하기`}
			</Button>
		</CustomBottomSheet>
	);
};

export default AddItemModal;

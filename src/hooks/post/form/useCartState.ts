import { useCallback, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import { showToast } from '@/components/ui/Toast';
import { CartItem, Item } from '@/types/post';

import { NewPostFormValues } from './newPostFormSchema';

interface UseCartStateReturn {
	// 모달 상태
	isAddModalVisible: boolean;
	isEditModalVisible: boolean;
	selectedItem: CartItem | null;

	// 모달 핸들러
	openAddModal: () => void;
	closeAddModal: () => void;
	openEditModal: (item: CartItem) => void;
	closeEditModal: () => void;

	// Cart 조작
	addItem: (item: Item) => void;
	updateItem: (item: CartItem) => void;
	deleteItem: (id: string) => void;
}

export const useCartState = (
	getValues: UseFormGetValues<NewPostFormValues>,
	setValue: UseFormSetValue<NewPostFormValues>,
): UseCartStateReturn => {
	const [isAddModalVisible, setIsAddModalVisible] = useState(false);
	const [isEditModalVisible, setIsEditModalVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

	// 모달 핸들러
	const openAddModal = useCallback(() => setIsAddModalVisible(true), []);
	const closeAddModal = useCallback(() => setIsAddModalVisible(false), []);

	const openEditModal = useCallback((item: CartItem) => {
		setSelectedItem(item);
		setIsEditModalVisible(true);
	}, []);
	const closeEditModal = useCallback(() => setIsEditModalVisible(false), []);

	// Cart 조작
	const addItem = useCallback(
		(item: Item) => {
			const cart = getValues('cart') ?? [];
			const isAlreadyAdded = cart.some((c) => c.id === item.id);

			if (isAlreadyAdded) {
				showToast('warn', '이미 추가된 아이템이에요.');
				return;
			}

			const newAddedItem: CartItem = {
				...item,
				quantity: 1,
				price: 1,
				unit: 'mileticket',
			};

			setValue('cart', [...cart, newAddedItem]);
			showToast('success', `${item.name}이(가) 추가되었어요.`);
		},
		[getValues, setValue],
	);

	const updateItem = useCallback(
		(updatedCartItem: CartItem) => {
			const cart = getValues('cart') ?? [];
			setValue(
				'cart',
				cart.map((cartItem) =>
					cartItem.id === updatedCartItem.id ? updatedCartItem : cartItem,
				),
			);
		},
		[getValues, setValue],
	);

	const deleteItem = useCallback(
		(deleteCartItemId: string) => {
			const cart = getValues('cart') ?? [];
			setValue(
				'cart',
				cart.filter((cartItem) => cartItem.id !== deleteCartItemId),
			);
		},
		[getValues, setValue],
	);

	return {
		// 모달 상태
		isAddModalVisible,
		isEditModalVisible,
		selectedItem,

		// 모달 핸들러
		openAddModal,
		closeAddModal,
		openEditModal,
		closeEditModal,

		// Cart 조작
		addItem,
		updateItem,
		deleteItem,
	};
};

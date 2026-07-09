import { useCallback, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import { showToast } from '@/components/ui/Toast';
import { MAX_CART_ITEMS } from '@/constants/post';
import { CartItem, Item } from '@/types/post';
import { logBulkAddOpen } from '@/utilities/analytics';

import { NewPostFormValues } from './newPostFormSchema';

interface UseCartStateReturn {
	// 모달 상태
	isAddModalVisible: boolean;
	isEditModalVisible: boolean;
	isBulkAddModalVisible: boolean;
	selectedItem: CartItem | null;
	bulkAddInitialText: string;

	// 모달 핸들러
	openAddModal: () => void;
	closeAddModal: () => void;
	openEditModal: (item: CartItem) => void;
	closeEditModal: () => void;
	openBulkAddModal: (initialText: string) => void;
	closeBulkAddModal: () => void;

	// Cart 조작
	addItem: (item: Item) => void;
	addItems: (items: Item[]) => void;
	updateItem: (item: CartItem) => void;
	deleteItem: (id: string) => void;
}

export const useCartState = (
	getValues: UseFormGetValues<NewPostFormValues>,
	setValue: UseFormSetValue<NewPostFormValues>,
): UseCartStateReturn => {
	const [isAddModalVisible, setIsAddModalVisible] = useState(false);
	const [isEditModalVisible, setIsEditModalVisible] = useState(false);
	const [isBulkAddModalVisible, setIsBulkAddModalVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
	const [bulkAddInitialText, setBulkAddInitialText] = useState('');

	// 모달 핸들러
	const openAddModal = useCallback(() => setIsAddModalVisible(true), []);
	const closeAddModal = useCallback(() => setIsAddModalVisible(false), []);

	const openEditModal = useCallback((item: CartItem) => {
		setSelectedItem(item);
		setIsEditModalVisible(true);
	}, []);
	const closeEditModal = useCallback(() => setIsEditModalVisible(false), []);

	const openBulkAddModal = useCallback((initialText: string) => {
		logBulkAddOpen();
		setIsAddModalVisible(false);
		setBulkAddInitialText(initialText);
		setIsBulkAddModalVisible(true);
	}, []);
	const closeBulkAddModal = useCallback(() => {
		setIsBulkAddModalVisible(false);
		setBulkAddInitialText('');
	}, []);

	// Cart 조작
	const addItem = useCallback(
		(item: Item) => {
			const cart = getValues('cart') ?? [];
			const isAlreadyAdded = cart.some((c) => c.id === item.id);

			if (isAlreadyAdded) {
				showToast('warn', '이미 추가된 아이템이에요.');
				return;
			}

			if (cart.length >= MAX_CART_ITEMS) {
				showToast('warn', `아이템은 최대 ${MAX_CART_ITEMS}개까지 추가할 수 있어요.`);
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

	// 일괄 추가 — 중복·상한 초과분은 제외하고 집계 토스트 1회
	const addItems = useCallback(
		(items: Item[]) => {
			const cart = getValues('cart') ?? [];
			const cartIds = new Set(cart.map((cartItem) => cartItem.id));
			const newItems = items.filter((item) => !cartIds.has(item.id));

			const capacity = Math.max(MAX_CART_ITEMS - cart.length, 0);
			const itemsToAdd = newItems.slice(0, capacity);

			if (itemsToAdd.length === 0) {
				showToast('warn', '추가할 수 있는 아이템이 없어요.');
				return;
			}

			const newCartItems: CartItem[] = itemsToAdd.map((item) => ({
				...item,
				quantity: 1,
				price: 1,
				unit: 'mileticket',
			}));

			setValue('cart', [...cart, ...newCartItems]);

			const skippedCount = items.length - itemsToAdd.length;
			showToast(
				'success',
				skippedCount > 0
					? `아이템 ${itemsToAdd.length}개가 추가되었어요. (${skippedCount}개 제외)`
					: `아이템 ${itemsToAdd.length}개가 추가되었어요.`,
			);
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
		isBulkAddModalVisible,
		selectedItem,
		bulkAddInitialText,

		// 모달 핸들러
		openAddModal,
		closeAddModal,
		openEditModal,
		closeEditModal,
		openBulkAddModal,
		closeBulkAddModal,

		// Cart 조작
		addItem,
		addItems,
		updateItem,
		deleteItem,
	};
};

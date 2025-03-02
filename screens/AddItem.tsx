import ItemSelect from '@/components/NewPost/ItemSelect';
import Button from '@/components/ui/Button';
import Layout from '@/components/ui/Layout';
import { AddItemRouteProp, HomeStackNavigation } from '@/types/navigation';
import { CartItem } from '@/types/post';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';

const AddItem = () => {
	const route = useRoute<AddItemRouteProp>();
	const navigation = useNavigation<HomeStackNavigation>();

	const { cart: initialCart } = route.params as { cart: CartItem[] };
	const [localCart, setLocalCart] = useState<CartItem[]>(initialCart);

	const saveAndGoBack = () => {
		navigation.popTo('NewPost', { updatedCart: localCart });
	};

	return (
		<Layout>
			<ItemSelect cart={localCart} setCart={setLocalCart} />
			<Button color='mint' size='lg' onPress={saveAndGoBack}>
				{localCart.length === 0 ? '추가' : `${localCart.length}개 추가하기`}
			</Button>
		</Layout>
	);
};

export default AddItem;

import ItemSelect from '@/components/NewPost/ItemSelect';
import Button from '@/components/ui/Button';
import Layout from '@/components/ui/Layout';
import { AddItemRouteProp, NewPostNavigation } from '@/types/navigation';
import { CartItem } from '@/types/post';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';

const AddItem = () => {
	const route = useRoute<AddItemRouteProp>();
	const navigation = useNavigation<NewPostNavigation>();

	const { cart: initialCart } = route.params as { cart: CartItem[] };
	const [localCart, setLocalCart] = useState<CartItem[]>(initialCart);

	const saveAndGoBack = () => {
		navigation.reset({
			index: 0,
			routes: [{ name: 'NewPost', params: { updatedCart: localCart } }],
		});
	};

	return (
		<Layout>
			<ItemSelect cart={localCart} setCart={setLocalCart} />
			<Button color='mint' size='lg' onPress={saveAndGoBack}>
				추가
			</Button>
		</Layout>
	);
};

export default AddItem;

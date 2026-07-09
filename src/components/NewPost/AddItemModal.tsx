import { StyleSheet } from 'react-native';

import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { AddItemModalProps } from '@/types/components';

import ItemSelect from './ItemSelect';

const AddItemModal = ({
	cart,
	addItemToCart,
	isVisible,
	onClose,
	initialKeyword,
}: AddItemModalProps) => {
	return (
		<CustomBottomSheet
			bodyStyle={styles.container}
			isVisible={isVisible}
			onClose={onClose}
			snapPoints={['95%', '100%']}
		>
			<ItemSelect
				cart={cart}
				addItemToCart={addItemToCart}
				initialKeyword={initialKeyword}
			/>
		</CustomBottomSheet>
	);
};

export default AddItemModal;

const styles = StyleSheet.create({
	container: {
		padding: 0,
		paddingBottom: 30
	},
});

import { StyleSheet } from 'react-native';

import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { AddItemModalProps } from '@/types/components';

import ItemSelect from './ItemSelect';

const AddItemModal = ({ cart, addItemToCart, isVisible, onClose }: AddItemModalProps) => {
	return (
		<CustomBottomSheet
			bodyStyle={styles.container}
			isVisible={isVisible}
			onClose={onClose}
			heightRatio={0.95}
		>
			<ItemSelect cart={cart} addItemToCart={addItemToCart} />
		</CustomBottomSheet>
	);
};

export default AddItemModal;

const styles = StyleSheet.create({
	container: {
		padding: 0,
	},
});

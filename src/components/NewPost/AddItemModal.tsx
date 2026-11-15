import { StyleSheet } from 'react-native';

import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { Spacing } from '@/theme';
import { AddItemModalProps } from '@/types/components';

import ItemSelect from './ItemSelect';

const AddItemModal = ({ cart, addItemToCart, isVisible, onClose }: AddItemModalProps) => {
	return (
		<CustomBottomSheet
			bodyStyle={styles.container}
			isVisible={isVisible}
			onClose={onClose}
			snapPoints={['95%', '100%']}
		>
			<ItemSelect cart={cart} addItemToCart={addItemToCart} />
		</CustomBottomSheet>
	);
};

export default AddItemModal;

const styles = StyleSheet.create({
	container: {
		padding: 0,
		// 하단 inset은 CustomBottomSheet가 비워 주므로, 목록 끝이 그 경계에 붙지 않을 만큼만 띄운다
		paddingBottom: Spacing.s,
	},
});

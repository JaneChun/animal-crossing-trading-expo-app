import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Color';
import { CURRENCY_OPTIONS } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { EditItemModalProps } from '@/types/components';
import { CartItem } from '@/types/post';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Total from '../PostDetail/Total';
import CustomModal from '../ui/CustomModal';
import DropdownInput from '../ui/inputs/DropdownInput';
import NumberInput from '../ui/inputs/NumberInput';

const EditItemModal = ({
	item,
	isVisible,
	onUpdate,
	onClose,
}: EditItemModalProps) => {
	const [quantityInput, setQuantityInput] = useState<number>(1);
	const [milesTicketInput, setMilesTicketInput] = useState<number>(1);
	const [selectedUnit, setSelectedUnit] = useState<string>('mileticket');
	const dropdownOptions = CURRENCY_OPTIONS.map(({ KR, EN }) => ({
		text: KR,
		value: EN,
	}));

	useEffect(() => {
		if (item) {
			setQuantityInput(item.quantity || 1);
			setMilesTicketInput(item.price || 1);
			setSelectedUnit('mileticket');
		}
	}, [item]);

	const onSubmit = () => {
		const updatedCartItem = {
			...item,
			quantity: quantityInput,
			price: milesTicketInput,
		} as CartItem;

		onUpdate(updatedCartItem);
		onClose();
	};

	return (
		<CustomModal
			modalHeight='53%'
			avoidKeyboard
			isVisible={isVisible}
			onClose={onClose}
		>
			<View style={styles.content}>
				{/* 타이틀 */}
				<Text style={styles.title}>{item?.name}</Text>
				{item?.color && <Text style={styles.subTitle}>{item?.color}</Text>}

				{/* 가격 */}
				<View style={styles.row}>
					<NumberInput
						value={milesTicketInput}
						setValue={setMilesTicketInput}
					/>
					<DropdownInput
						options={dropdownOptions}
						disabled
						value={selectedUnit}
						setValue={setSelectedUnit}
					/>
				</View>

				{/* 개수 */}
				<View style={styles.row}>
					<NumberInput value={quantityInput} setValue={setQuantityInput} />
					<View
						style={[styles.inputContainer, { backgroundColor: Colors.base }]}
					>
						<Text style={styles.text}>개</Text>
					</View>
				</View>

				{/* 총계 */}
				<View style={styles.totalContainer}>
					<Total
						cart={[
							{
								...item,
								quantity: quantityInput,
								price: milesTicketInput,
							} as CartItem,
						]}
					/>
				</View>
			</View>

			{/* 버튼 */}
			<Button color='mint' size='lg2' onPress={onSubmit}>
				수정하기
			</Button>
		</CustomModal>
	);
};

export default EditItemModal;

const styles = StyleSheet.create({
	content: {
		flex: 1,
		gap: 8,
	},
	title: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.bold,
	},
	subTitle: {
		fontSize: FontSizes.md,
		color: Colors.font_gray,
		marginBottom: 16,
	},
	row: {
		flexDirection: 'row',
		gap: 8,
	},
	inputContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 8,
		backgroundColor: 'transparent',
		height: 48,
		paddingHorizontal: 16,
	},
	text: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
	},
	totalContainer: {
		justifyContent: 'flex-end',
		marginTop: 8,
	},
});

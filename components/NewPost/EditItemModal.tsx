import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Color';
import { EditItemModalProps } from '@/types/components';
import { CartItem } from '@/types/post';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';
import Total from '../PostDetail/Total';
import DropdownInput from '../ui/DropdownInput';
import NumberInput from '../ui/NumberInput';

const EditItemModal = ({
	item,
	isVisible,
	onUpdate,
	onClose,
}: EditItemModalProps) => {
	const [quantityInput, setQuantityInput] = useState<number>(1);
	const [milesTicketInput, setMilesTicketInput] = useState<number>(1);
	const [selectedUnit, setSelectedUnit] = useState('마일 티켓'); // TODO: enums로 변경
	const options = ['마일 티켓', '벨']; // TODO: enums로 변경

	useEffect(() => {
		if (item) {
			setQuantityInput(item.quantity || 1);
			setMilesTicketInput(item.price || 1);
			setSelectedUnit('마일 티켓'); // TODO: item의 unit에서 가져오기
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
		<Modal
			isVisible={isVisible}
			onBackdropPress={onClose}
			backdropOpacity={0.5}
			avoidKeyboard={true}
			style={styles.screen}
		>
			<View style={styles.modal}>
				<View style={styles.content}>
					{/* 타이틀 */}
					<Text style={styles.title}>{item?.name}</Text>

					{/* 개수 */}
					<View style={styles.row}>
						<NumberInput value={quantityInput} setValue={setQuantityInput} />
						<View
							style={[styles.inputContainer, { backgroundColor: Colors.base }]}
						>
							<Text style={styles.text}>개</Text>
						</View>
					</View>

					{/* 가격 */}
					<View style={styles.row}>
						<NumberInput
							value={milesTicketInput}
							setValue={setMilesTicketInput}
						/>
						<DropdownInput
							options={options}
							value={selectedUnit}
							setValue={setSelectedUnit}
						/>
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
				<Button color='mint' size='lg' onPress={onSubmit}>
					수정하기
				</Button>
			</View>
		</Modal>
	);
};

export default EditItemModal;

const styles = StyleSheet.create({
	screen: {
		justifyContent: 'flex-end',
		margin: 0,
	},
	modal: {
		height: '40%',
		backgroundColor: 'white',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 30,
	},
	content: {
		flex: 1,
		gap: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
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
		fontSize: 16,
		fontWeight: 600,
		color: Colors.font_black,
	},
	totalContainer: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingBottom: 16,
	},
});

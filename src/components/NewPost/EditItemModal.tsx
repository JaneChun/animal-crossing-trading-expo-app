import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Total from '@/components/PostDetail/Total';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import DropdownInput from '@/components/ui/inputs/DropdownInput';
import NumberInput from '@/components/ui/inputs/NumberInput';
import Text from '@/components/ui/Text';
import { CURRENCY_OPTIONS } from '@/constants/post';
import { Theme, useThemedStyles } from '@/theme';
import { EditItemModalProps } from '@/types/components';
import { CartItem } from '@/types/post';

const EditItemModal = ({ item, isVisible, updateItemFromCart, onClose }: EditItemModalProps) => {
	const styles = useThemedStyles(makeStyles);
	const [quantityInput, setQuantityInput] = useState<number>(1);
	const [milesTicketInput, setMilesTicketInput] = useState<number>(1);
	const [selectedUnit, setSelectedUnit] = useState<string>('mileticket');
	const dropdownOptions = CURRENCY_OPTIONS.map(({ KR, EN }) => ({
		text: KR,
		value: EN,
	}));

	// 초기값 입력
	useEffect(() => {
		if (item) {
			setQuantityInput(item.quantity || 1);
			setMilesTicketInput(item.price || 1);
			setSelectedUnit(item.unit || 'mileticket');
		}
	}, [item]);

	// 값 변경 시 바로 업데이트
	useEffect(() => {
		if (!item) return;

		const updatedCartItem = {
			...item,
			quantity: quantityInput,
			price: milesTicketInput,
			unit: selectedUnit,
		} as CartItem;

		updateItemFromCart(updatedCartItem);
	}, [quantityInput, milesTicketInput, selectedUnit]);

	return (
		<CustomBottomSheet isVisible={isVisible} onClose={onClose} snapPoints={['40%']}>
			<View style={styles.content}>
				{/* 타이틀 */}
				<Text variant="heading" weight="bold">
					{item?.name}
				</Text>
				{item?.color && (
					<Text variant="body1" color="tertiary" style={styles.subTitle}>
						{item?.color}
					</Text>
				)}

				{/* 가격 */}
				<View style={styles.row}>
					<NumberInput
						value={milesTicketInput}
						setValue={setMilesTicketInput}
						InputComponent={BottomSheetTextInput}
						style={{ flexGrow: 1 }}
					/>
					<DropdownInput
						options={dropdownOptions}
						value={selectedUnit}
						setValue={setSelectedUnit}
						style={{ flexGrow: 1 }}
					/>
				</View>

				{/* 개수 */}
				<View style={styles.row}>
					<NumberInput
						value={quantityInput}
						setValue={setQuantityInput}
						InputComponent={BottomSheetTextInput}
					/>
					<View style={[styles.inputContainer, styles.unitContainer]}>
						<Text variant="body1" weight="semibold">
							개
						</Text>
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
		</CustomBottomSheet>
	);
};

export default EditItemModal;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		content: {
			flex: 1,
			gap: 8,
		},
		subTitle: {
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
			borderColor: colors.border.default,
			borderRadius: 8,
			backgroundColor: 'transparent',
			height: 48,
			paddingHorizontal: 16,
		},
		unitContainer: {
			backgroundColor: colors.bg.secondary,
		},
		totalContainer: {
			justifyContent: 'flex-end',
			marginTop: 24,
		},
	});

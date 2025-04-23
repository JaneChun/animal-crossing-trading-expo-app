import { Colors } from '@/constants/Color';
import { DropdownOption, DropdownOptionProps } from '@/types/components';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
	LayoutRectangle,
	Modal as RNmodal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const DropdownInput = ({
	options,
	value,
	setValue,
	disabled,
}: DropdownOptionProps) => {
	const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
	const [dropdownPosition, setDropdownPosition] =
		useState<LayoutRectangle | null>(null);

	const comboBoxRef = useRef<View | null>(null);

	const openModal = () => {
		if (comboBoxRef?.current) {
			comboBoxRef.current.measure((x, y, width, height, pageX, pageY) => {
				setDropdownPosition({ x: pageX, y: pageY + height, width, height });
			});
		}
	};

	useEffect(() => {
		if (dropdownPosition) setDropdownVisible(true);
	}, [dropdownPosition]);

	const handleSelect = (option: DropdownOption) => {
		setValue(option.value);
		setDropdownVisible(false);
	};

	return (
		<>
			<TouchableOpacity
				ref={comboBoxRef}
				style={[
					styles.inputContainer,
					disabled && { backgroundColor: Colors.base },
					{ paddingLeft: 18 },
				]}
				onPress={openModal}
				disabled={disabled}
			>
				<Text style={styles.text}>
					{options.find((opt) => opt.value === value)?.text || '선택'}
				</Text>

				<Feather name='chevron-down' size={24} color={Colors.font_gray} />
			</TouchableOpacity>

			{/* 모달 드롭다운 */}
			<RNmodal visible={isDropdownVisible} transparent>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setDropdownVisible(false)}
				/>
				{dropdownPosition && (
					<View
						style={[
							styles.modalContent,
							{
								top: dropdownPosition.y,
								left: dropdownPosition.x,
								width: dropdownPosition.width,
							},
						]}
					>
						{options.map((item: DropdownOption, index: number) => (
							<TouchableOpacity
								key={item.value}
								style={[
									styles.option,
									index === 0 && styles.optionBorderBottom,
								]}
								onPress={() => handleSelect(item)}
							>
								<Text style={styles.optionText}>{item.text}</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
			</RNmodal>
		</>
	);
};

export default DropdownInput;

const styles = StyleSheet.create({
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
	modalOverlay: {
		flex: 1,
	},
	modalContent: {
		position: 'absolute',
		backgroundColor: Colors.base,
		borderColor: Colors.border_gray,
		borderRadius: 8,
		marginTop: 8,
		elevation: 5,
		shadowColor: Colors.border_gray,
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowOpacity: 1,
		shadowRadius: 2,
	},
	option: {
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	optionText: {
		fontSize: 14,
		color: Colors.font_black,
	},
	optionBorderBottom: {
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
});

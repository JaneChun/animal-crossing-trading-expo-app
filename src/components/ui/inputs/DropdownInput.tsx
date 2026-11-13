import { Feather } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
	LayoutRectangle,
	Pressable,
	Modal as RNmodal,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

import { BorderRadius, Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { DropdownInputProps, DropdownOption } from '@/types/components';

import Text from '../Text';

const DropdownInput = ({
	options,
	value,
	setValue,
	disabled,
	topOffset = 0,
	style,
}: DropdownInputProps) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();
	const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
	const [dropdownPosition, setDropdownPosition] = useState<LayoutRectangle | null>(null);

	const comboBoxRef = useRef<View | null>(null);

	const openModal = () => {
		comboBoxRef.current?.measureInWindow?.((px, py, w, h) => {
			setDropdownPosition({ x: px, y: py + h, width: w, height: h });
		});
		setDropdownVisible(true);
	};

	const handleSelect = (option: DropdownOption) => {
		setValue(option.value);
		setDropdownVisible(false);
	};

	return (
		<>
			<Pressable
				ref={comboBoxRef}
				style={[
					styles.inputContainer,
					disabled && { backgroundColor: colors.bg.secondary },
					style,
				]}
				onPress={openModal}
				disabled={disabled}
			>
				<Text variant="body1" weight="semibold" style={styles.text}>
					{options.find((opt) => opt.value === value)?.text || '선택'}
				</Text>

				<Feather
					name={`chevron-${isDropdownVisible ? 'up' : 'down'}`}
					size={24}
					color={colors.brand.primary}
				/>
			</Pressable>

			{/* 모달 드롭다운 */}
			<RNmodal visible={isDropdownVisible} transparent>
				<Pressable style={styles.modalOverlay} onPress={() => setDropdownVisible(false)} />
				{dropdownPosition && (
					<View
						style={[
							styles.modalContent,
							{
								top: dropdownPosition.y + topOffset,
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
									index !== options.length - 1 && styles.optionBorderBottom,
								]}
								onPress={() => handleSelect(item)}
							>
								<Text variant="body1" style={styles.optionText}>
									{item.text}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
			</RNmodal>
		</>
	);
};

export default DropdownInput;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		inputContainer: {
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			borderWidth: 1,
			// borderColor: colors.border.default,
			borderColor: colors.brand.primary,
			borderRadius: BorderRadius.s,
			backgroundColor: 'transparent',
			height: 48,
			paddingHorizontal: Spacing.l,
		},
		text: {
			// color: colors.text.primary,
			color: colors.brand.primary,
		},
		modalOverlay: {
			flex: 1,
		},
		modalContent: {
			position: 'absolute',
			backgroundColor: colors.bg.primary,
			borderRadius: BorderRadius.s,
			borderWidth: 1,
			borderColor: colors.border.default,
			marginTop: Spacing.s,
			elevation: 5,
			shadowColor: colors.border.default,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			shadowOpacity: 1,
			shadowRadius: 2,
		},
		option: {
			paddingVertical: 14,
			paddingHorizontal: Spacing.l,
		},
		optionText: {
			color: colors.text.secondary,
		},
		optionBorderBottom: {
			// borderBottomWidth: 1,
			// borderBottomColor: colors.border.default,
		},
	});

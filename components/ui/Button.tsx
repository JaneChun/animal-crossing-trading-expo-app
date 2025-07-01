import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { ButtonColor, ButtonProps, ButtonSize } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const Button = ({
	children,
	onPress,
	color,
	size,
	flex = false,
	style,
	disabled,
}: ButtonProps) => {
	const getColorStyles = (color: ButtonColor) => {
		switch (color) {
			case 'mint':
				return styles.mint;
			case 'white':
				return styles.white;
			case 'gray':
				return styles.gray;
			case 'red': {
				return styles.red;
			}
			case 'redWhite': {
				return styles.redWhite;
			}
			default:
				return {};
		}
	};

	const getTextStyles = (color: ButtonColor) => {
		switch (color) {
			case 'mint':
				return { color: 'white' };
			case 'white':
				return { color: Colors.primary };
			case 'gray':
				return { color: Colors.font_black };
			case 'red': {
				return { color: 'white' };
			}
			case 'redWhite': {
				return { color: Colors.badge_red };
			}
			default:
				return {};
		}
	};

	const getSizeStyles = (size: ButtonSize) => {
		switch (size) {
			case 'sm':
				return styles.sm;
			case 'md':
				return styles.md;
			case 'md2':
				return styles.md2;
			case 'lg':
				return styles.lg;
			case 'lg2':
				return styles.lg2;
			default:
				return {};
		}
	};

	const colorStyles = getColorStyles(color);
	const textStyles = getTextStyles(color);
	const sizeStyles = getSizeStyles(size);

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			style={[
				styles.button,
				sizeStyles,
				disabled ? styles.disabledStyle : colorStyles,
				flex && { flex: 1 },
				style,
			]}
		>
			<Text style={[styles.text, disabled ? styles.disabledText : textStyles]}>
				{children}
			</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	disabledStyle: {
		backgroundColor: Colors.border_gray,
		borderWidth: 1,
		borderColor: Colors.border_gray,
	},
	disabledText: {
		color: Colors.font_gray,
	},
	mint: {
		backgroundColor: Colors.primary,
		borderWidth: 1,
		borderColor: Colors.primary,
	},
	white: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: Colors.primary,
	},
	gray: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: Colors.border_gray,
	},
	red: {
		backgroundColor: Colors.badge_red,
		borderWidth: 1,
		borderColor: Colors.badge_red,
	},
	redWhite: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: Colors.badge_red,
	},
	text: {
		fontWeight: FontWeights.bold,
		fontSize: FontSizes.md,
	},
	sm: {
		paddingVertical: 6,
		paddingHorizontal: 12,
	},
	md: {
		paddingVertical: 8,
		paddingHorizontal: 16,
	},
	md2: {
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	lg: {
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	lg2: {
		paddingVertical: 16,
		paddingHorizontal: 16,
	},
});

export default React.memo(Button);

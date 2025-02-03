import { Colors } from '@/constants/Color';
import React from 'react';
import {
	Text,
	TouchableOpacity,
	StyleSheet,
	GestureResponderEvent,
} from 'react-native';

type Color = 'mint' | 'white' | 'gray';
type Size = 'sm' | 'md' | 'md2' | 'lg';

interface ButtonProps {
	type?: 'submit' | undefined;
	color: Color;
	size: Size;
	style?: object;
	onPress?: (event: GestureResponderEvent) => void;
	children: React.ReactNode;
}

const Button = ({
	type,
	color,
	size,
	style,
	onPress,
	children,
}: ButtonProps) => {
	const getColorStyles = (color: Color) => {
		switch (color) {
			case 'mint':
				return styles.mint;
			case 'white':
				return styles.white;
			case 'gray':
				return styles.gray;
			default:
				return {};
		}
	};

	const getTextStyles = (color: Color) => {
		switch (color) {
			case 'mint':
				return { color: 'white' };
			case 'white':
				return { color: Colors.primary };
			case 'gray':
				return { color: Colors.font_gray };
			default:
				return {};
		}
	};

	const getSizeStyles = (size: Size) => {
		switch (size) {
			case 'sm':
				return styles.sm;
			case 'md':
				return styles.md;
			case 'md2':
				return styles.md2;
			case 'lg':
				return styles.lg;
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
			style={[styles.button, colorStyles, sizeStyles, style]}
		>
			<Text style={[styles.text, textStyles]}>{children}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
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
		backgroundColor: Colors.border_gray,
		borderWidth: 1,
		borderColor: Colors.border_gray,
	},
	text: {
		fontWeight: 'bold',
		fontSize: 16,
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
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
});

export default Button;

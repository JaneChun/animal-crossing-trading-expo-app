import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';
import { ButtonProps, ButtonSize } from '@/types/components';

import Text from './Text';

const PRESSED_OPACITY = 0.7;

const SIZE_TEXT_PROPS = {
	sm: { variant: 'body2', weight: 'semibold' },
	md: { variant: 'body1', weight: 'bold' },
	lg: { variant: 'body1', weight: 'bold' },
} as const satisfies Record<ButtonSize, object>;

const Button = ({
	children,
	onPress,
	variant = 'primary',
	size = 'md',
	isLoading = false,
	leftIcon,
	flex = false,
	style,
	disabled = false,
	testID,
}: ButtonProps) => {
	const styles = useThemedStyles(makeStyles);

	// disabled이면서 loading이면 loading 표시를 우선하되 색은 disabled 색을 쓴다
	const colorKey = disabled ? 'disabled' : variant;
	const containerColorStyle = styles[colorKey];
	const textColorStyle = styles[`${colorKey}Text`];

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled || isLoading}
			style={({ pressed }) => [
				styles.button,
				styles[size],
				containerColorStyle,
				pressed && styles.pressed,
				flex && styles.flex,
				style,
			]}
			testID={testID}
		>
			{/* 로딩 중에도 버튼 너비를 유지하도록 내용은 숨기기만 하고 자리를 남긴다 */}
			<View style={[styles.content, isLoading && styles.hidden]}>
				{leftIcon}
				<Text {...SIZE_TEXT_PROPS[size]} numberOfLines={1} style={textColorStyle}>
					{children}
				</Text>
			</View>
			{isLoading && (
				<ActivityIndicator style={StyleSheet.absoluteFill} color={textColorStyle.color} />
			)}
		</Pressable>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		button: {
			borderRadius: BorderRadius.s,
			borderWidth: 1,
			justifyContent: 'center',
			alignItems: 'center',
		},
		content: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.xs,
		},
		hidden: {
			opacity: 0,
		},
		pressed: {
			opacity: PRESSED_OPACITY,
		},
		flex: {
			flex: 1,
		},

		// size
		sm: {
			height: 32,
			paddingHorizontal: Spacing.m,
		},
		md: {
			height: 40,
			paddingHorizontal: Spacing.l,
		},
		lg: {
			height: 52,
			paddingHorizontal: Spacing.l,
		},

		// variant
		primary: {
			backgroundColor: colors.brand.primary,
			borderColor: colors.brand.primary,
		},
		primaryText: {
			color: colors.text.onBrand,
		},
		outline: {
			backgroundColor: 'transparent',
			borderColor: colors.brand.primary,
		},
		outlineText: {
			color: colors.brand.primary,
		},
		secondary: {
			backgroundColor: 'transparent',
			borderColor: colors.border.default,
		},
		secondaryText: {
			color: colors.text.primary,
		},
		danger: {
			backgroundColor: colors.status.danger,
			borderColor: colors.status.danger,
		},
		dangerText: {
			color: colors.text.onBrand,
		},
		dangerOutline: {
			backgroundColor: 'transparent',
			borderColor: colors.status.danger,
		},
		dangerOutlineText: {
			color: colors.status.danger,
		},
		ghost: {
			backgroundColor: 'transparent',
			borderColor: 'transparent',
		},
		ghostText: {
			color: colors.text.secondary,
		},
		disabled: {
			backgroundColor: colors.border.default,
			borderColor: colors.border.default,
		},
		disabledText: {
			color: colors.text.tertiary,
		},
	});

export default memo(Button);

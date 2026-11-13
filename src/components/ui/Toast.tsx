import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Toast, { BaseToastProps } from 'react-native-toast-message';

import { BorderRadius, Spacing, Theme, useTheme, useThemedStyles } from '@/theme';

import Text from './Text';

interface CustomToastProps extends BaseToastProps {
	text1?: string;
}

type ToastType = 'success' | 'error' | 'warn' | 'info';

const ToastView = ({ type, text }: { type: ToastType; text?: string }) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();

	const backgroundColors: Record<ToastType, string> = {
		success: colors.status.success,
		error: colors.status.error,
		warn: colors.status.warning,
		info: colors.status.info,
	};
	const icons: Record<ToastType, ReactNode> = {
		success: <FontAwesome6 name="check-circle" size={20} color={colors.text.onBrand} />,
		error: <FontAwesome6 name="xmark-circle" size={20} color={colors.text.onBrand} />,
		warn: <FontAwesome name="warning" size={20} color={colors.text.onBrand} />,
		info: <FontAwesome6 name="circle-info" size={20} color={colors.text.onBrand} />,
	};

	return (
		<View style={[styles.container, { backgroundColor: backgroundColors[type] }]}>
			<View style={styles.icon}>{icons[type]}</View>
			<View style={styles.textContainer}>
				<Text variant="body2" style={styles.text}>
					{text}
				</Text>
			</View>
		</View>
	);
};

export const toastConfig = {
	success: ({ text1 }: CustomToastProps) => <ToastView type="success" text={text1} />,
	error: ({ text1 }: CustomToastProps) => <ToastView type="error" text={text1} />,
	warn: ({ text1 }: CustomToastProps) => <ToastView type="warn" text={text1} />,
	info: ({ text1 }: CustomToastProps) => <ToastView type="info" text={text1} />,
};

export const showToast = (
	type: 'success' | 'error' | 'warn' | 'info',
	text: string,
	topOffset?: number,
) => {
	Toast.show({
		type: type,
		text1: text,
		topOffset: topOffset ? topOffset : 50,
		position: 'top',
		visibilityTime: 2000,
	});
};

export const showLongToast = (
	type: 'success' | 'error' | 'warn' | 'info',
	text: string,
	topOffset?: number,
) => {
	Toast.show({
		type: type,
		text1: text,
		topOffset: topOffset ? topOffset : 50,
		position: 'top',
		visibilityTime: 5000,
	});
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '85%',
			padding: 14,
			borderRadius: BorderRadius.l,
		},
		icon: {
			marginRight: Spacing.s,
		},
		textContainer: {
			flex: 1,
			marginLeft: Spacing.s,
		},
		text: {
			color: colors.text.onBrand,
			flexWrap: 'wrap',
			textAlign: 'center',
		},
	});

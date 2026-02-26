import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Toast, { BaseToastProps } from 'react-native-toast-message';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';

interface CustomToastProps extends BaseToastProps {
	text1?: string;
}

export const toastConfig = {
	success: ({ text1 }: CustomToastProps) => (
		<View style={[styles.container, { backgroundColor: Colors.status.success }]}>
			<FontAwesome6
				name="check-circle"
				size={20}
				color={Colors.text.inverse}
				style={{ marginRight: 8 }}
			/>
			<View style={styles.textContainer}>
				<Text style={styles.text}>{text1}</Text>
			</View>
		</View>
	),
	error: ({ text1 }: CustomToastProps) => (
		<View style={[styles.container, { backgroundColor: Colors.status.error }]}>
			<FontAwesome6
				name="xmark-circle"
				size={20}
				color={Colors.text.inverse}
				style={{ marginRight: 8 }}
			/>
			<View style={styles.textContainer}>
				<Text style={styles.text}>{text1}</Text>
			</View>
		</View>
	),
	warn: ({ text1 }: CustomToastProps) => (
		<View style={[styles.container, { backgroundColor: Colors.status.warning }]}>
			<FontAwesome
				name="warning"
				size={20}
				color={Colors.text.inverse}
				style={{ marginRight: 8 }}
			/>
			<View style={styles.textContainer}>
				<Text style={styles.text}>{text1}</Text>
			</View>
		</View>
	),
	info: ({ text1 }: CustomToastProps) => (
		<View style={[styles.container, { backgroundColor: '#1E90FF' }]}>
			<FontAwesome6
				name="circle-info"
				size={20}
				color={Colors.text.inverse}
				style={{ marginRight: 8 }}
			/>
			<View style={styles.textContainer}>
				<Text style={styles.text}>{text1}</Text>
			</View>
		</View>
	),
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

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '85%',
		padding: 14,
		borderRadius: 16,
	},
	textContainer: {
		flex: 1,
		marginLeft: 8,
	},
	text: {
		color: Colors.text.inverse,
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.regular,
		flexWrap: 'wrap',
		textAlign: 'center',
	},
});

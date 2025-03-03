import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Toast, { BaseToastProps } from 'react-native-toast-message';

interface CustomToastProps extends BaseToastProps {
	text1?: string;
}

export const toastConfig = {
	success: ({ text1 }: CustomToastProps) => (
		<View style={[styles.container, { backgroundColor: '#2dcd6f' }]}>
			<FontAwesome6
				name='check-circle'
				size={20}
				color='white'
				style={{ marginRight: 8 }}
			/>
			<Text style={styles.text}>{text1}</Text>
		</View>
	),
	error: ({ text1 }: CustomToastProps) => (
		<View style={[styles.container, { backgroundColor: '#E73B2A' }]}>
			<FontAwesome6
				name='xmark-circle'
				size={20}
				color='white'
				style={{ marginRight: 8 }}
			/>
			<Text style={styles.text}>{text1}</Text>
		</View>
	),
	warn: ({ text1 }: CustomToastProps) => (
		<View style={[styles.container, { backgroundColor: '#FFA500' }]}>
			<FontAwesome
				name='warning'
				size={20}
				color='white'
				style={{ marginRight: 8 }}
			/>
			<Text style={styles.text}>{text1}</Text>
		</View>
	),
	info: ({ text1 }: CustomToastProps) => (
		<View style={[styles.container, { backgroundColor: '#1E90FF' }]}>
			<FontAwesome6
				name='circle-info'
				size={20}
				color='white'
				style={{ marginRight: 8 }}
			/>
			<Text style={styles.text}>{text1}</Text>
		</View>
	),
};

export const showToast = (
	type: 'success' | 'error' | 'warn' | 'info',
	text: string,
) => {
	Toast.show({
		type: type,
		text1: text,
		topOffset: 5,
		position: 'top',
		visibilityTime: 2000,
	});
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		width: '85%',
		padding: 14,
		borderRadius: 16,
	},
	text: { color: 'white', fontWeight: 400, fontSize: 14 },
});

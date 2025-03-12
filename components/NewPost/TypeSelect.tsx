import { Colors } from '@/constants/Color';
import { TypeSelectProps } from '@/types/components';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TypeSelect = ({ type, setType }: TypeSelectProps) => {
	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[
					styles.button,
					type === 'buy' && styles.buttonActive,
					{
						borderRightWidth: 0,
						borderTopRightRadius: 0,
						borderBottomRightRadius: 0,
					},
				]}
				onPress={() => setType('buy')}
			>
				<Text style={[styles.text, type === 'buy' && styles.textActive]}>
					구해요
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.button,
					type === 'sell' && styles.buttonActive,
					{
						borderTopLeftRadius: 0,
						borderBottomLeftRadius: 0,
					},
				]}
				onPress={() => setType('sell')}
			>
				<Text style={[styles.text, type === 'sell' && styles.textActive]}>
					팔아요
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default TypeSelect;

const styles = StyleSheet.create({
	container: {
		width: '45%',
		flexDirection: 'row',
		marginBottom: 16,
	},
	button: {
		flex: 1,
		padding: 12,
		alignItems: 'center',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.border_gray,
	},
	buttonActive: {
		backgroundColor: Colors.button_pressed,
	},
	text: {
		fontSize: 16,
		color: Colors.font_black,
		fontWeight: 400,
	},
	textActive: {
		color: Colors.primary,
		fontWeight: 600,
	},
});

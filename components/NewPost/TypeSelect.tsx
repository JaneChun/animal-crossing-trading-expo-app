import { Colors } from '@/constants/Color';
import { Dispatch, SetStateAction } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity } from 'react-native';

type TypeSelectProps = {
	type: 'buy' | 'sell' | 'done';
	setType: Dispatch<SetStateAction<'buy' | 'sell' | 'done'>>;
};

const TypeSelect = ({ type, setType }: TypeSelectProps) => {
	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[
					styles.button,
					type === 'buy' && styles.buttonActive,
					{ borderTopRightRadius: 0, borderBottomRightRadius: 0 },
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
		backgroundColor: Colors.border_gray,
	},
	text: {
		fontSize: 16,
		color: Colors.font_black,
		fontWeight: 'semibold',
	},
	textActive: {
		color: Colors.primary,
		fontWeight: 'bold',
	},
});

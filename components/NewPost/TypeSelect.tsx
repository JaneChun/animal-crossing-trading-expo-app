import { Colors } from '@/constants/Color';
import { TypeSelectProps } from '@/types/components';
import { MarketType } from '@/types/post';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TypeSelect = ({ type, setType }: TypeSelectProps) => {
	const typeOptions: MarketType[] = ['buy', 'sell'];

	const typeButtonMap: Record<
		MarketType,
		{ label: string; sideStyle: object }
	> = {
		buy: {
			label: '구해요',
			sideStyle: {
				borderRightWidth: 0,
				borderTopRightRadius: 0,
				borderBottomRightRadius: 0,
			},
		},
		sell: {
			label: '팔아요',
			sideStyle: {
				borderTopLeftRadius: 0,
				borderBottomLeftRadius: 0,
			},
		},
		done: {
			label: '거래완료',
			sideStyle: {},
		},
	};

	return (
		<View style={styles.container}>
			{typeOptions.map((option) => (
				<TouchableOpacity
					key={option}
					style={[
						styles.button,
						type === option && styles.buttonActive,
						typeButtonMap[option].sideStyle,
					]}
					onPress={() => setType(option)}
				>
					<Text style={[styles.text, type === option && styles.textActive]}>
						{typeButtonMap[option].label}
					</Text>
				</TouchableOpacity>
			))}
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

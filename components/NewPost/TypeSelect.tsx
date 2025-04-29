import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { TypeSelectProps } from '@/types/components';
import { MarketType } from '@/types/post';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TypeSelect = ({
	type,
	setType,
	containerStyle,
	labelStyle,
}: TypeSelectProps) => {
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
		<View style={containerStyle}>
			<View style={styles.container}>
				{typeOptions.map((option) => (
					<Pressable
						key={option}
						style={[styles.button, type === option && styles.buttonActive]}
						onPress={() => setType(option)}
					>
						<Text style={[styles.text, type === option && styles.textActive]}>
							{typeButtonMap[option].label}
						</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
};

export default TypeSelect;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		marginBottom: 16,
		gap: 6,
	},
	button: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		alignItems: 'center',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Colors.border_gray,
	},
	buttonActive: {
		backgroundColor: 'white',
		borderColor: Colors.primary,
	},
	text: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.regular,
		color: Colors.font_gray,
	},
	textActive: {
		color: Colors.primary,
		fontWeight: FontWeights.semibold,
	},
});

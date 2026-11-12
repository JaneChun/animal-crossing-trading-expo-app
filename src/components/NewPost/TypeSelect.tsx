import { Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';
import { TypeSelectProps } from '@/types/components';
import { MarketType } from '@/types/post';

const TypeSelect = ({ type, setType, containerStyle, labelStyle }: TypeSelectProps) => {
	const styles = useThemedStyles(makeStyles);
	const typeOptions: MarketType[] = ['buy', 'sell'];

	const typeButtonMap: Record<MarketType, { label: string; sideStyle: object }> = {
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
						<Text
							weight={type === option ? 'semibold' : 'regular'}
							color="tertiary"
							style={type === option && styles.textActive}
						>
							{typeButtonMap[option].label}
						</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
};

export default TypeSelect;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
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
			borderColor: colors.border.default,
		},
		buttonActive: {
			backgroundColor: colors.bg.primary,
			borderColor: colors.brand.primary,
		},
		textActive: {
			color: colors.brand.primary,
		},
	});

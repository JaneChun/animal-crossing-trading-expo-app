import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme';

import ImageWithFallback from '../ui/ImageWithFallback';

interface VariantOptionListProps {
	options: { label: string; imageUrl: string }[];
	onSelect: (value: string) => void;
}

const VariantOptionList = ({ options, onSelect }: VariantOptionListProps) => {
	return (
		<View style={styles.listContainer}>
			{options.map((opt) => {
				return (
					<TouchableOpacity
						key={opt.label}
						style={styles.container}
						onPress={() => onSelect(opt.label)}
					>
						<ImageWithFallback uri={opt.imageUrl} style={styles.image} />
						<Text style={styles.name} numberOfLines={1}>
							{opt.label}
						</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	listContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 16,
		paddingHorizontal: 12,
	},
	container: {
		width: '47%', // 2열
		aspectRatio: 1, // 1:1 비율
		backgroundColor: Colors.bg.secondary,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
	},
	image: {
		width: 90,
		height: 90,
		borderRadius: 16,
		marginBottom: 10,
	},
	name: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.text.primary,
		textAlign: 'center',
		paddingHorizontal: 8,
	},
});

export default VariantOptionList;

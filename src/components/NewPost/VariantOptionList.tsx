import { TouchableOpacity, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';

import ImageWithFallback from '../ui/ImageWithFallback';

interface VariantOptionListProps {
	options: { label: string; imageUrl: string }[];
	onSelect: (value: string) => void;
}

const VariantOptionList = ({ options, onSelect }: VariantOptionListProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.listContainer}>
			{options.map((opt) => {
				return (
					<View key={opt.label} style={styles.wrapper}>
						<TouchableOpacity
							style={styles.container}
							onPress={() => onSelect(opt.label)}
						>
							<ImageWithFallback uri={opt.imageUrl} style={styles.image} />
							<Text
								variant="body2"
								weight="semibold"
								style={styles.name}
								numberOfLines={1}
							>
								{opt.label}
							</Text>
						</TouchableOpacity>
					</View>
				);
			})}
		</View>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
	listContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 16,
		paddingHorizontal: 12,
	},
	wrapper: {
		width: '47%',
		aspectRatio: 1,
	},
	container: {
		flex: 1,
		backgroundColor: colors.bg.secondary,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		overflow: 'hidden',
	},
	image: {
		width: 90,
		height: 90,
		borderRadius: 16,
		marginBottom: 10,
	},
	name: {
		textAlign: 'center',
		paddingHorizontal: 8,
	},
});

export default VariantOptionList;

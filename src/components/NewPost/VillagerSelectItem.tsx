import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import HighlightMatchText from '@/components/ui/HighlightMatchText';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { FontWeights , Theme, useThemedStyles } from '@/theme';
import { VillagerSelectItemProps } from '@/types/components';

export const VILLAGER_ITEM_HEIGHT = 53;

const VillagerSelectItem = ({
	villager,
	searchInput,
	addVillager,
	index,
}: VillagerSelectItemProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<TouchableOpacity
			style={styles.container}
			onPress={() => addVillager(villager)}
			testID={`villagerSelectItem-${index}`}
		>
			{/* 이미지 */}
			<View style={styles.imageContainer}>
				<ImageWithFallback uri={villager.imageUrl} style={styles.image} priority="normal" />
			</View>
			{/* 이름 */}
			<Text
				variant="body2"
				weight="semibold"
				color="secondary"
				numberOfLines={1}
				ellipsizeMode="tail"
				style={styles.nameContainer}
			>
				<HighlightMatchText
					text={villager.name}
					keyword={searchInput}
					textStyle={{}}
					highlightTextStyle={styles.highlight}
				/>
			</Text>
		</TouchableOpacity>
	);
};

export default memo<VillagerSelectItemProps>(VillagerSelectItem, (prevProps, nextProps) => {
	return (
		prevProps.villager.id === nextProps.villager.id &&
		prevProps.searchInput === nextProps.searchInput
	);
});

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			width: '31%',
			aspectRatio: '1/1',
			// 화면 폭이 좁은 기기(Android 약 360dp)에서 정사각형이면 이름이 잘리므로,
			// 이미지 60 + 위아래 패딩 16 + 이름 여백 4 + 이름 줄 높이 20만큼은 확보한다
			minHeight: 100,
			alignItems: 'center',
			padding: 8,
			backgroundColor: colors.bg.fill,
			borderRadius: 12,
		},
		imageContainer: {
			position: 'relative',
		},
		image: {
			width: 60,
			height: 60,
			borderRadius: 8,
		},
		nameContainer: {
			flex: 1,
			marginTop: 4,
			textAlign: 'center',
		},
		highlight: {
			fontWeight: FontWeights.bold,
			color: colors.brand.primary,
		},
	});

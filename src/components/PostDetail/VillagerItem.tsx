import { StyleSheet, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { VILLAGER_PERSONALITIES } from '@/constants/post';
import { Theme, useThemedStyles } from '@/theme';
import { VillagerItemProps } from '@/types/components';

const VillagerItem = ({ villager, containerStyle = {} }: VillagerItemProps) => {
	const styles = useThemedStyles(makeStyles);
	const personalityText =
		VILLAGER_PERSONALITIES.find((p) => p.EN === villager.personality)?.KR || '';
	return (
		<View style={[styles.container, containerStyle]}>
			{/* 이미지 */}
			<ImageWithFallback uri={villager.imageUrl} style={styles.image} />

			{/* 본문 */}
			<View style={styles.body}>
				<Text variant="body1" weight="semibold" numberOfLines={1} ellipsizeMode="tail">
					{villager.name}
				</Text>
				<Text variant="body2" color="tertiary">
					{personalityText}
				</Text>
			</View>
		</View>
	);
};

export default VillagerItem;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexBasis: '48%',
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 12,
			paddingHorizontal: 16,
			backgroundColor: colors.bg.fill,
			borderRadius: 16,
		},
		body: {
			flex: 1,
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'flex-start',
			gap: 5,
		},
		image: {
			width: 30,
			height: 30,
			borderRadius: 15,
			marginRight: 12,
		},
	});

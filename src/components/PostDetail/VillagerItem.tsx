import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Colors } from '@/constants/Color';
import { VILLAGER_PERSONALITIES } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { VillagerItemProps } from '@/types/components';

const VillagerItem = ({ villager, containerStyle = {} }: VillagerItemProps) => {
	const personalityText =
		VILLAGER_PERSONALITIES.find((p) => p.EN === villager.personality)?.KR || '';
	return (
		<View style={[styles.container, containerStyle]}>
			{/* 이미지 */}
			<ImageWithFallback uri={villager.imageUrl} style={styles.image} />

			{/* 본문 */}
			<View style={styles.body}>
				<Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
					{villager.name}
				</Text>
				<Text style={styles.personality}>{personalityText}</Text>
			</View>
		</View>
	);
};

export default VillagerItem;

const styles = StyleSheet.create({
	container: {
		flexBasis: '48%',
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: Colors.base,
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
	name: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
	},
	personality: {
		fontSize: FontSizes.sm,
		color: Colors.font_gray,
	},
});

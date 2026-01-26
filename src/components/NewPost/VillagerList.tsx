import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Colors } from '@/constants/Color';
import { MAX_VILLAGERS } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { VillagerListProps } from '@/types/components';

const VillagerList = ({
	villagers,
	deleteVillager,
	openAddVillagerModal,
	containerStyle,
	labelStyle,
}: VillagerListProps) => {
	const canAddMore = villagers.length < MAX_VILLAGERS;

	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>주민</Text>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* 선택된 주민 목록 */}
				{villagers.map((villager) => (
					<View key={villager.id} style={styles.villagerItem}>
						{/* 삭제 버튼 */}
						<TouchableOpacity
							style={styles.removeButton}
							onPress={() => deleteVillager(villager.id)}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons name="close-circle" size={20} color={Colors.font_gray} />
						</TouchableOpacity>
						{/* 이미지 */}
						<View style={styles.imageContainer}>
							<ImageWithFallback
								uri={villager.imageUrl}
								style={styles.villagerImage}
								priority="normal"
							/>
						</View>
						{/* 이름 */}
						<Text style={styles.villagerName} numberOfLines={1}>
							{villager.name}
						</Text>
					</View>
				))}

				{/* 주민 추가 버튼 */}
				{canAddMore && (
					<TouchableOpacity
						style={styles.addButton}
						onPress={openAddVillagerModal}
						testID="addVillagerButton"
					>
						<Ionicons name="add" size={32} color={Colors.font_gray} />
					</TouchableOpacity>
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	scrollContent: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingTop: 8,
		paddingBottom: 16,
		gap: 12,
	},
	villagerItem: {
		width: 100,
		height: 100,
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: Colors.base,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.border_gray,
	},
	imageContainer: {
		position: 'relative',
	},
	villagerImage: {
		width: 60,
		height: 60,
	},
	removeButton: {
		position: 'absolute',
		top: 4,
		right: 4,
		borderRadius: 10,
	},
	villagerName: {
		marginTop: 4,
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.font_dark_gray,
		textAlign: 'center',
	},
	addButton: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 1,
		backgroundColor: Colors.base,
		borderColor: Colors.base,
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 'auto',
	},
});

export default VillagerList;

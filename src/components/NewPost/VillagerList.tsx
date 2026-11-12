import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { MAX_VILLAGERS } from '@/constants/post';
import { Theme, useThemedStyles } from '@/theme';
import { VillagerListProps } from '@/types/components';

const VillagerList = ({
	villagers,
	deleteVillager,
	openAddVillagerModal,
	containerStyle,
	labelStyle,
}: VillagerListProps) => {
	const styles = useThemedStyles(makeStyles);
	const canAddMore = villagers.length < MAX_VILLAGERS;

	return (
		<View style={containerStyle}>
			<Text variant="body1" weight="semibold" style={labelStyle}>
				주민
			</Text>

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
							<Ionicons name="close-circle" size={20} color={styles.icon.color} />
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
						<Text
							variant="body2"
							weight="semibold"
							color="secondary"
							style={styles.villagerName}
							numberOfLines={1}
						>
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
						<Ionicons name="add" size={32} color={styles.icon.color} />
					</TouchableOpacity>
				)}
			</ScrollView>
		</View>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
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
		backgroundColor: colors.bg.secondary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border.default,
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
		textAlign: 'center',
	},
	icon: {
		color: colors.text.tertiary,
	},
	addButton: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 1,
		backgroundColor: colors.bg.secondary,
		borderColor: colors.bg.secondary,
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 'auto',
	},
});

export default VillagerList;

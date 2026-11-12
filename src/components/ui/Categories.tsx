import { Entypo } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';
import { CategoriesProps } from '@/types/components';
import { Category, CategoryItem, ItemCategory, ItemCategoryItem } from '@/types/post';
import { VillagerSpecies, VillagerSpeciesItem } from '@/types/villager';

import Text from './Text';

const Categories = <
	T extends Category | ItemCategory | VillagerSpecies,
	U extends CategoryItem | ItemCategoryItem | VillagerSpeciesItem,
>({
	categories,
	category,
	setCategory,
	containerStyle,
}: CategoriesProps<T, U>) => {
	const styles = useThemedStyles(makeStyles);
	const [showAll, setShowAll] = useState(false);

	const renderCategoryButton = (item: U) => (
		<Pressable
			key={item.EN}
			style={[styles.category, category === item.EN && styles.categorySelected]}
			onPress={() => setCategory(item.EN as T)}
		>
			<Text
				variant="body2"
				weight="semibold"
				style={[styles.categoryText, category === item.EN && styles.categoryTextSelected]}
			>
				{item.KR}
			</Text>
		</Pressable>
	);

	const toggleButton = (
		<Pressable
			style={[styles.toggleButton, !showAll && { marginRight: 6 }]}
			onPress={() => setShowAll((prev) => !prev)}
		>
			<Entypo
				name={showAll ? 'chevron-up' : 'chevron-down'}
				size={20}
				color={styles.categoryTextSelected.color}
			/>
		</Pressable>
	);

	return (
		<View style={containerStyle}>
			{showAll ? (
				<View style={styles.flexWrapContainer}>
					{toggleButton}
					{categories.map(renderCategoryButton)}
				</View>
			) : (
				<View style={styles.flatListContainer}>
					{toggleButton}
					<FlatList
						data={categories}
						keyExtractor={(item) => item.EN}
						renderItem={({ item }) => renderCategoryButton(item)}
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.flatListContentContainer}
					/>
				</View>
			)}
		</View>
	);
};

export default Categories;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		flexWrapContainer: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			alignItems: 'center',
			gap: 6,
		},
		flatListContainer: {
			flexDirection: 'row',
		},
		flatListContentContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
		},
		category: {
			paddingVertical: Spacing.s,
			paddingHorizontal: 14,
			borderRadius: BorderRadius.full,
			backgroundColor: colors.bg.secondary,
			borderWidth: 1,
			borderColor: colors.bg.secondary,
		},
		categorySelected: {
			backgroundColor: colors.bg.primary,
			borderColor: colors.brand.primary,
		},
		categoryText: {
			color: colors.text.tertiary,
		},
		categoryTextSelected: {
			color: colors.brand.primary,
		},
		toggleButton: {
			padding: 6,
			justifyContent: 'center',
			alignItems: 'center',
		},
	});

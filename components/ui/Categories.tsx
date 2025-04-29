import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { CategoriesProps } from '@/types/components';
import {
	Category,
	CategoryItem,
	ItemCategory,
	ItemCategoryItem,
} from '@/types/post';
import { Entypo } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const Categories = <
	T extends Category | ItemCategory,
	U extends CategoryItem | ItemCategoryItem,
>({
	categories,
	category,
	setCategory,
	containerStyle,
}: CategoriesProps<T, U>) => {
	const [showAll, setShowAll] = useState(false);

	const renderCategoryButton = (item: U) => (
		<Pressable
			key={item.EN}
			style={[styles.category, category === item.EN && styles.categorySelected]}
			onPress={() => setCategory(item.EN as T)}
		>
			<Text
				style={[
					styles.categoryText,
					category === item.EN && styles.categoryTextSelected,
				]}
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
				color={Colors.primary}
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

const styles = StyleSheet.create({
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
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 50,
		backgroundColor: Colors.base,
		borderWidth: 1,
		borderColor: Colors.base,
	},
	categorySelected: {
		backgroundColor: 'white',
		borderColor: Colors.primary,
	},
	categoryText: {
		color: Colors.font_gray,
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
	},
	categoryTextSelected: {
		color: Colors.primary,
	},
	toggleButton: {
		padding: 6,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

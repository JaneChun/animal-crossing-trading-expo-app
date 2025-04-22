import { Colors } from '@/constants/Color';
import { CategoriesProps } from '@/types/components';
import {
	Category,
	CategoryItem,
	ItemCategory,
	ItemCategoryItem,
} from '@/types/post';
import { Entypo } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

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
		<TouchableOpacity
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
		</TouchableOpacity>
	);

	const toggleButton = (
		<TouchableOpacity
			style={[styles.toggleButton, !showAll && { marginRight: 6 }]}
			onPress={() => setShowAll((prev) => !prev)}
		>
			<Entypo
				name={showAll ? 'chevron-up' : 'chevron-down'}
				size={20}
				color={Colors.primary}
			/>
		</TouchableOpacity>
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
		borderRadius: 16,
		backgroundColor: Colors.base,
	},
	categorySelected: {
		backgroundColor: Colors.primary,
	},
	categoryText: {
		color: Colors.font_gray,
		fontSize: 14,
	},
	categoryTextSelected: {
		color: 'white',
	},
	toggleButton: {
		padding: 6,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

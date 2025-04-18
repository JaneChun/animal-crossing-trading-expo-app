import { Colors } from '@/constants/Color';
import { CategoriesProps } from '@/types/components';
import { CategoryItem } from '@/types/post';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Categories = ({
	categories,
	category,
	setCategory,
	containerStyle,
}: CategoriesProps) => {
	return (
		<View style={[styles.categoriesContainer, containerStyle]}>
			{categories.map((item: CategoryItem) => (
				<TouchableOpacity
					key={item.EN}
					style={[
						styles.category,
						category === item.EN && styles.categorySelected,
					]}
					onPress={() => setCategory(item.EN)}
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
			))}
		</View>
	);
};

export default Categories;

const styles = StyleSheet.create({
	categoriesContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
		alignItems: 'center',
		marginVertical: 8,
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
});

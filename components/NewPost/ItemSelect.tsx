import { Colors } from '@/constants/Color';
import type { CartItem } from '@/screens/NewPost';
import axios from 'axios';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	StyleProp,
	StyleSheet,
	Text,
	TextInput,
	TextStyle,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

type ItemSelectProps = {
	cart: CartItem[];
	setCart: Dispatch<SetStateAction<CartItem[]>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
};

type Item = {
	UniqueEntryID: string;
	color: string;
	imageUrl: string;
	name: string;
};

const ItemSelect = ({
	cart,
	setCart,
	containerStyle,
	labelStyle,
}: ItemSelectProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [category, setCategory] = useState<string | null>(null);
	const [itemData, setItemData] = useState<Item[]>([]);
	const [searchInput, setSearchInput] = useState<string>('');
	const [searchedItemData, setSearchedItemData] = useState<Item[]>([]);

	// 카테고리 변경 시 호출
	useEffect(() => {
		const getData = async () => {
			if (!category) return;

			setIsLoading(true);
			try {
				const response = await axios.get(
					`${process.env.EXPO_PUBLIC_DATABASE_URL}/items/${category}.json`,
				);
				if (response.status === 200) {
					setItemData(response.data);
				} else {
					throw new Error(response.statusText);
				}
			} catch (error) {
				console.error('Failed to fetch data:', error);
			}
			setIsLoading(false);
		};

		getData();
	}, [category]);

	// 검색어 입력 시 호출
	useEffect(() => {
		if (!itemData) return;

		const filtered = itemData.filter((item) => item.name.includes(searchInput));
		setSearchedItemData(filtered);
	}, [searchInput, itemData]);

	const addItemToCart = (item: Item) => {
		const isAlreadyAdded = cart.find(
			(cartItem) => cartItem.UniqueEntryID === item.UniqueEntryID,
		);
		if (!isAlreadyAdded) {
			setCart([...cart, { ...item, quantity: 1, price: 1 }]);
		}
	};

	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={labelStyle}>아이템 선택</Text>
			<View style={styles.categoriesContainer}>
				{categories.map((item) => (
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

			{category && (
				<View style={styles.listContainer}>
					<TextInput
						style={styles.searchInput}
						placeholder='아이템 검색..'
						value={searchInput}
						onChangeText={setSearchInput}
					/>

					{isLoading ? (
						<View style={styles.spinnerContainer}>
							<ActivityIndicator size='large' color={Colors.primary} />
						</View>
					) : (
						<FlatList
							data={searchInput ? searchedItemData : itemData}
							keyExtractor={(item, index) =>
								item.UniqueEntryID ?? index.toString()
							}
							style={styles.itemList}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.item}
									onPress={() => addItemToCart(item)}
								>
									<Image
										source={{ uri: item.imageUrl }}
										style={styles.itemImage}
									/>
									<Text style={styles.itemTextContainer}>
										<Text>{item.name}</Text>
										<Text style={styles.itemColorText}>
											{item.color && ` (${item.color})`}
										</Text>
									</Text>
								</TouchableOpacity>
							)}
							ListEmptyComponent={() => (
								<View style={styles.spinnerContainer}>
									<Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
								</View>
							)}
						/>
					)}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {},
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
	emptyText: {
		fontSize: 14,
		color: Colors.font_gray,
	},
	listContainer: {
		height: 400,
	},
	searchInput: {
		marginTop: 16,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 8,
		backgroundColor: Colors.base,
	},
	itemList: {
		marginTop: 16,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 6,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	itemImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
	},
	itemTextContainer: {
		fontSize: 16,
		flexDirection: 'row',
	},
	itemColorText: {
		color: Colors.font_gray,
	},
	spinnerContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 100,
	},
});

export default ItemSelect;

const categories = [
	{ KR: '가구', EN: 'Houswares' },
	{ KR: '잡화', EN: 'Miscellaneous' },
	{ KR: '벽걸이', EN: 'Wallmounted' },
	{ KR: '레시피', EN: 'Recipes' },
	{ KR: '요리', EN: 'Food' },
	{ KR: '모자', EN: 'Headwear' },
	{ KR: '상의', EN: 'Tops' },
	{ KR: '하의', EN: 'Bottoms' },
	{ KR: '원피스', EN: 'DressUp' },
	{ KR: '양말', EN: 'Socks' },
	{ KR: '가방', EN: 'Bags' },
	{ KR: '신발', EN: 'Shoes' },
	{ KR: '악세사리', EN: 'Accessories' },
	{ KR: '우산', EN: 'Umbrellas' },
	{ KR: '천장', EN: 'CeilingDecor' },
	{ KR: '벽지', EN: 'Wallpaper' },
	{ KR: '바닥', EN: 'Floors' },
	{ KR: '러그', EN: 'Rugs' },
	{ KR: '음악', EN: 'Music' },
	{ KR: '토용', EN: 'Gyroids' },
];

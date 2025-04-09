import { Colors } from '@/constants/Color';
import useLoading from '@/hooks/useLoading';
import { ItemSelectProps } from '@/types/components';
import { Item } from '@/types/post';
import axios from 'axios';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import {
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Categories from '../ui/Categories';
import { showToast } from '../ui/Toast';

const ItemSelect = ({
	cart,
	setCart,
	containerStyle,
	labelStyle,
}: ItemSelectProps) => {
	const {
		isLoading: isFetching,
		setIsLoading: setIsFetching,
		InlineLoadingIndicator,
	} = useLoading();
	const [category, setCategory] = useState<string>('All');
	const [itemData, setItemData] = useState<Item[]>([]);
	const [searchInput, setSearchInput] = useState<string>('');
	const [searchedItemData, setSearchedItemData] = useState<Item[]>([]);

	// 카테고리 변경 시 호출
	useEffect(() => {
		const getData = async () => {
			if (!category) return;

			setIsFetching(true);
			try {
				const response = await axios.get(
					`${process.env.EXPO_PUBLIC_DATABASE_URL}/items${
						category === 'All' ? '' : `/${category}`
					}.json`,
				);

				if (response.status === 200) {
					if (category === 'All') {
						const flattened = Object.values(response.data).flat() as Item[];
						setItemData(flattened);
					} else {
						setItemData(response.data);
					}
				} else {
					throw new Error(response.statusText);
				}
			} catch (error) {
				console.error('Failed to fetch data:', error);
			}
			setIsFetching(false);
		};

		getData();
	}, [category]);

	// 검색어 입력 시 호출
	const handleSearch = debounce((text: string) => {
		const filtered = itemData.filter((item) => item.name.includes(text));
		setSearchedItemData(filtered);
	}, 300);

	const addItemToCart = (item: Item) => {
		const isAlreadyAdded = cart.find(
			(cartItem) => cartItem.UniqueEntryID === item.UniqueEntryID,
		);

		if (isAlreadyAdded) {
			showToast('warn', '이미 추가된 아이템이에요.', 5);
		} else {
			setCart([...cart, { ...item, quantity: 1, price: 1 }]);
			showToast('success', `${item.name}이(가) 추가되었어요.`, 5);
		}
	};

	return (
		<View style={[styles.container, containerStyle]}>
			{/* 검색 인풋 */}
			<TextInput
				style={styles.searchInput}
				placeholder='🔍 아이템 검색..'
				value={searchInput}
				onChangeText={(text) => {
					setSearchInput(text);
					handleSearch(text);
				}}
			/>

			{/* 카테고리 칩 */}
			<Categories
				categories={categories}
				category={category}
				setCategory={setCategory}
			/>

			{/* 아이템 목록 */}
			{category && (
				<View style={styles.listContainer}>
					{isFetching ? (
						<InlineLoadingIndicator />
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
	container: {
		flex: 1,
	},

	emptyText: {
		fontSize: 14,
		color: Colors.font_gray,
	},
	listContainer: {
		flex: 1,
	},
	searchInput: {
		fontSize: 16,
		marginBottom: 8,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 20,
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
	{ KR: '전체', EN: 'All' },
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

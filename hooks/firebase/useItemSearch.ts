import { db } from '@/fbase';
import { queryDocs } from '@/firebase/core/firestoreService';
import { Item, ItemCategory } from '@/types/post';
import { collection, limit, Query, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useItemSearch = ({
	keyword,
	category,
	size,
}: {
	keyword: string;
	category?: ItemCategory;
	size?: number;
}) => {
	const [items, setItems] = useState<Item[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		const fetchItems = async () => {
			const trimmed = keyword?.trim() || '';

			if (trimmed.length < 2) {
				setItems([]);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				let q: Query = collection(db, 'Items');

				q = query(q, where('searchKeywords', 'array-contains', trimmed));

				if (category && category !== 'All') {
					q = query(q, where('category', '==', category));
				}

				if (size) {
					q = query(q, limit(size));
				}

				const data = await queryDocs<Item>(q);

				setItems(data);
			} catch (err) {
				console.log('검색 오류:', err);
				setItems([]);
			}

			setIsLoading(false);
		};

		fetchItems();
	}, [category, keyword]);

	return { items, isLoading };
};

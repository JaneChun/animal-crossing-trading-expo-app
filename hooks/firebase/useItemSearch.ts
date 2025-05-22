import { db } from '@/fbase';
import { queryDocs } from '@/firebase/core/firestoreService';
import { Item, ItemCategory } from '@/types/post';
import { useQuery } from '@tanstack/react-query';
import { collection, limit, query, Query, where } from 'firebase/firestore';

export const useItemSearch = ({
	keyword,
	category,
	size,
}: {
	keyword: string;
	category?: ItemCategory;
	size?: number;
}) => {
	const trimmed = keyword.trim();

	return useQuery({
		queryKey: ['itemSearch', trimmed, category, size],
		queryFn: async () => {
			let q: Query = query(
				collection(db, 'Items'),
				where('searchKeywords', 'array-contains', trimmed),
			);

			if (category && category !== 'All') {
				q = query(q, where('category', '==', category));
			}

			if (size) {
				q = query(q, limit(size));
			}

			const data = await queryDocs<Item>(q);

			return data;
		},
		enabled: trimmed.length >= 2,
	});
};

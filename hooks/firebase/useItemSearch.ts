// hooks/useItemSearch.ts
import { db } from '@/fbase';
import { Collection } from '@/types/post';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';

export const useItemSearch = (collectionName: Collection, keyword: string) => {
	const [results, setResults] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// debounce 적용: 300ms 후 실행
		const debouncedSearch = debounce(async () => {
			if (!keyword.trim()) return setResults([]);

			setLoading(true);
			try {
				const q = query(
					collection(db, collectionName),
					where('searchKeywords', 'array-contains', keyword),
				);

				const snapshot = await getDocs(q);
				const data = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setResults(data);
			} catch (err) {
				console.log('검색 오류:', err);
			}
			setLoading(false);
		}, 300);

		debouncedSearch();
		return () => debouncedSearch.cancel();
	}, [keyword]);

	return { results, loading };
};

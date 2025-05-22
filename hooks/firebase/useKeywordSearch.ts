import { db } from '@/fbase';
import { queryDocs } from '@/firebase/core/firestoreService';
import { Collection } from '@/types/post';
import { useQuery } from '@tanstack/react-query';
import { collection, Query, query, where } from 'firebase/firestore';

export const useKeywordSearch = ({
	collectionName,
	keyword,
}: {
	collectionName: Collection;
	keyword: string;
}) => {
	const trimmed = keyword.trim();

	return useQuery({
		queryKey: ['communityTitleSearch', keyword],
		queryFn: async () => {
			const q: Query = query(
				collection(db, collectionName),
				where('isDeleted', '!=', true),
				where('searchKeywords', 'array-contains', keyword.toLowerCase()),
			);

			const data = await queryDocs(q);

			return data;
		},
		enabled: trimmed.length >= 2,
	});
};

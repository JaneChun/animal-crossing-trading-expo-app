import { useQuery } from '@tanstack/react-query';
import { collection, query } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { queryDocs } from '@/firebase/core/firestoreService';
import { CatalogVariant } from '@/types/catalog';

const fetchItemVariants = async (catalogItemId: string): Promise<CatalogVariant[]> => {
	const q = query(collection(db, 'CatalogItems', catalogItemId, 'variants'));
	const variants = await queryDocs<CatalogVariant>(q);

	return variants;
};

export const useItemVariants = (catalogItemId?: string) => {
	return useQuery({
		queryKey: ['itemVariants', catalogItemId],
		queryFn: () => fetchItemVariants(catalogItemId!),
		enabled: !!catalogItemId,
		staleTime: 1000 * 60 * 60, // 1 hour (Variants don't change often)
	});
};

import { useQuery } from '@tanstack/react-query';
import { collection, query, where } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { queryDocs } from '@/firebase/core/firestoreService';
import { Villager } from '@/types/villager';
import { MAX_VILLAGERS } from '@/constants/post';

const fetchVillagersByIds = async (villagerIds: string[]): Promise<Villager[]> => {
	const q = query(collection(db, 'Villagers'), where('__name__', 'in', villagerIds.slice(0, MAX_VILLAGERS)));

	const villagers = await queryDocs<Villager>(q);

	return villagers;
};

/**
 * 주민 ID 배열을 받아서 해당하는 Villager 객체들을 반환하는 훅
 */
export const useVillagersByIds = (villagerIds: string[]): Villager[] => {
	const { data: villagers = [] } = useQuery<Villager[]>({
		queryKey: ['villagers', 'byIds', villagerIds],
		queryFn: () => {
			if (villagerIds.length === 0) return [];
			return fetchVillagersByIds(villagerIds);
		},
		enabled: villagerIds.length > 0,
	});

	return villagers;

};

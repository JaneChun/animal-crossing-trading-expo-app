import { useQuery } from '@tanstack/react-query';
import { collection, orderBy, query, where } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { queryDocs } from '@/firebase/core/firestoreService';
import { Villager, VillagerSpecies } from '@/types/villager';

/**
 * Firestore에서 주민 데이터를 가져오는 함수
 * species 필터가 'All'이면 전체 주민 반환, 그 외에는 해당 종만 필터링
 */
const fetchVillagers = async (species?: VillagerSpecies): Promise<Villager[]> => {
	const villagersRef = collection(db, 'Villagers');

	const q =
		species && species !== 'All'
			? query(villagersRef, where('species', '==', species), orderBy('name'))
			: query(villagersRef, orderBy('name'));

	const villagersData = await queryDocs(q);

	return villagersData.map((doc) => doc as Villager);
};

type UseVillagersOptions = {
	enabled?: boolean;
};

/**
 * 주민 목록을 가져오는 React Query 훅
 * @param species - 필터링할 종 ('All'이면 전체)
 * @param keyword - 검색 키워드 (클라이언트 사이드 필터링)
 * @param options - React Query 옵션 (enabled 등)
 */
export const useVillagers = (
	species?: VillagerSpecies,
	keyword?: string,
	options: UseVillagersOptions = { enabled: true },
) => {
	return useQuery<Villager[], Error>({
		queryKey: ['villagers', species],
		queryFn: () => fetchVillagers(species),
		staleTime: 24 * 60 * 60 * 1000, // 24시간
		enabled: options.enabled,
		select: (data) => {
			// 키워드가 있으면 클라이언트 사이드에서 필터링
			if (keyword && keyword.trim()) {
				return data.filter((villager) =>
					villager.name.toLowerCase().includes(keyword.toLowerCase()),
				);
			}
			return data;
		},
	});
};

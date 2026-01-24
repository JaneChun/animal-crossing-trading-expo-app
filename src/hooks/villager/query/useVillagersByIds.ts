import { useMemo } from 'react';

import { Villager } from '@/types/villager';

import { useVillagers } from './useVillagers';

/**
 * 주민 ID 배열을 받아서 해당하는 Villager 객체들을 반환하는 훅
 *
 * @param villagerIds - 조회할 주민 ID 배열
 * @returns 해당 ID에 매칭되는 Villager 객체 배열
 */
export const useVillagersByIds = (villagerIds: string[]): Villager[] => {
	const { data: allVillagers = [] } = useVillagers('All', '', {
		enabled: villagerIds.length > 0,
	});

	return useMemo(
		() => allVillagers.filter((v) => villagerIds.includes(v.id)),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[allVillagers.length, villagerIds],
	);
};

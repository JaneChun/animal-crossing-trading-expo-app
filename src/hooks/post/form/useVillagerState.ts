import { useCallback, useEffect, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import { showToast } from '@/components/ui/Toast';
import { MAX_VILLAGERS } from '@/constants/post';
import { useVillagers } from '@/hooks/villager/query/useVillagers';
import { Villager } from '@/types/villager';

import { NewPostFormValues } from './newPostFormSchema';

interface UseVillagerStateReturn {
	// 모달 상태
	isModalVisible: boolean;
	selectedVillagers: Villager[];

	// 모달 핸들러
	openModal: () => void;
	closeModal: () => void;

	// Villager 조작
	addVillager: (villager: Villager) => void;
	deleteVillager: (id: string) => void;
}

export const useVillagerState = (
	getValues: UseFormGetValues<NewPostFormValues>,
	setValue: UseFormSetValue<NewPostFormValues>,
	/** 편집 모드에서 기존 게시글의 villager ID 배열 */
	existingVillagerIds: string[] = [],
): UseVillagerStateReturn => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedVillagers, setSelectedVillagers] = useState<Villager[]>([]);

	// 편집 모드에서만 전체 주민 목록 조회
	const { data: allVillagers = [] } = useVillagers('All', '', {
		enabled: existingVillagerIds.length > 0,
	});

	// 편집 모드 초기화: 기존 주민 데이터 로딩
	useEffect(() => {
		if (allVillagers.length === 0) return;

		const existingVillagers = allVillagers.filter((v) => existingVillagerIds.includes(v.id));

		setSelectedVillagers(existingVillagers);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allVillagers.length, existingVillagerIds]);

	// 모달 핸들러
	const openModal = useCallback(() => setIsModalVisible(true), []);
	const closeModal = useCallback(() => setIsModalVisible(false), []);

	// Villager 조작
	const addVillager = useCallback(
		(villager: Villager) => {
			const villagerIds = getValues('villagers') ?? [];
			const isAlreadyAdded = villagerIds.includes(villager.id);

			if (isAlreadyAdded) {
				showToast('warn', '이미 추가된 주민이에요.');
				return;
			}

			if (villagerIds.length >= MAX_VILLAGERS) {
				showToast('warn', `최대 ${MAX_VILLAGERS}명까지 추가할 수 있어요.`);
				return;
			}

			// Form에는 id만 저장
			setValue('villagers', [...villagerIds, villager.id]);
			// UI 표시용으로 전체 객체 저장
			setSelectedVillagers((prev) => [...prev, villager]);
			showToast('success', `${villager.name}이(가) 추가되었어요.`);
		},
		[getValues, setValue],
	);

	const deleteVillager = useCallback(
		(villagerId: string) => {
			const villagerIds = getValues('villagers') ?? [];
			// Form에서 id 제거
			setValue(
				'villagers',
				villagerIds.filter((id) => id !== villagerId),
			);
			// UI 표시용 목록에서도 제거
			setSelectedVillagers((prev) => prev.filter((v) => v.id !== villagerId));
		},
		[getValues, setValue],
	);

	return {
		// 모달 상태
		isModalVisible,
		selectedVillagers,

		// 모달 핸들러
		openModal,
		closeModal,

		// Villager 조작
		addVillager,
		deleteVillager,
	};
};

import { TAB_COLLECTION_CONFIG } from '@/constants/post';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { Collection } from '@/types/post';

export const usePostContext = () => {
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const config = TAB_COLLECTION_CONFIG[activeTab];

	if (!config) {
		return {
			activeTab: 'Home' as const,
			collectionName: 'Boards' as Collection,
		};
	}

	const collectionName = config.collection as Collection;

	return {
		activeTab,
		collectionName,
	};
};

import { TAB_COLLECTION_CONFIG } from '@/constants/post';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { CollectionFromTab } from '@/types/post';

export const usePostContext = () => {
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const config = TAB_COLLECTION_CONFIG[activeTab];

	const collectionName = config.collection as CollectionFromTab<
		typeof activeTab
	>;

	return {
		activeTab,
		collectionName,
	};
};

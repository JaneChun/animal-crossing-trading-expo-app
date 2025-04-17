import { TAB_COLLECTION_CONFIG } from '@/constants/post';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import {
	Collection,
	CollectionFromTab,
	Post,
	PostWithCreatorInfo,
} from '@/types/post';

export const usePostContext = () => {
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const config = TAB_COLLECTION_CONFIG[activeTab];
	const collectionName = config.collection as CollectionFromTab<
		typeof activeTab
	>;

	type BoardPost = PostWithCreatorInfo<'Boards'> | Post<'Boards'>;

	type CommunityPost = PostWithCreatorInfo<'Communities'> | Post<'Communities'>;

	// 타입 가드 함수
	const isBoardPost = (
		post: PostWithCreatorInfo<Collection> | Post<Collection>,
		collectionName: Collection,
	): post is BoardPost => {
		return (
			collectionName === 'Boards' &&
			post !== null &&
			typeof post === 'object' &&
			'cart' in post
		);
	};

	const isCommunityPost = (
		post: PostWithCreatorInfo<Collection> | Post<Collection>,
		collectionName: Collection,
	): post is CommunityPost => {
		return (
			collectionName === 'Communities' &&
			post !== null &&
			typeof post === 'object' &&
			'images' in post
		);
	};

	return {
		activeTab,
		collectionName,
		isDynamic: config.isDynamic,
		isBoardPost,
		isCommunityPost,
	};
};

import type { ListItem } from '@/types/components';
import type { Collection, PostWithCreatorInfo } from '@/types/post';

/** 게시글 배열에 interval 간격으로 광고 플레이스홀더를 삽입 */
export const insertAds = (
	posts: PostWithCreatorInfo<Collection>[],
	interval: number,
): ListItem[] => {
	const result: ListItem[] = [];

	for (let i = 0; i < posts.length; i++) {
		if (i > 0 && i % interval === 0) {
			result.push({ type: 'ad', id: `ad-${i}` });
		}
		result.push({ type: 'post', data: posts[i] });
	}

	return result;
};

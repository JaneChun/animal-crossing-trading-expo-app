import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';

import { searchClient } from '@/config/firebase';
import { getPublicUserInfos } from '@/firebase/services/userService';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { toPost } from '@/utilities/toPost'; // Import toPost

import type { Collection, Post, PostDoc, PostWithCreatorInfo } from '@/types/post'; // Ensure PostDoc is imported

const PAGE_SIZE = 10;

export const useSearchPosts = <C extends Collection>({
	collectionName,
	keyword,
}: {
	collectionName: C;
	keyword: string;
}) => {
	const searchPostsByCursor = async ({ pageParam = 0 }): Promise<PostWithCreatorInfo<C>[]> => {
		const { results } = await searchClient.searchForHits<PostDoc<C>>({
			requests: [
				{
					indexName: collectionName,
					query: keyword,
					hitsPerPage: PAGE_SIZE,
					page: pageParam, // 시작 페이지 번호
					filters: 'NOT status:hidden AND NOT status:deleted', // 숨김/삭제된 게시글 제외
				},
			],
		});

		// PostDoc을 Post로 변환하면서 createdAt, updatedAt을 Timestamp로 변환
		const data: Post<C>[] = results[0].hits.map((hit) => {
			const createdAt = Number(hit.createdAt) || Date.now(); // 데이터 안정성
			const updatedAt = Number(hit.updatedAt) || Date.now();

			const postDoc: PostDoc<C> = {
				...hit,
				id: hit.objectID,
				createdAt: Timestamp.fromMillis(createdAt),
				updatedAt: Timestamp.fromMillis(updatedAt),
			};

			return toPost(collectionName, postDoc);
		});

		// CreatorInfo 병합
		const uniqueCreatorIds: string[] = Array.from(
			new Set(data.map((item: Post<C>) => item.creatorId)),
		);
		const publicUserInfos = await getPublicUserInfos(uniqueCreatorIds);
		const populatedData: PostWithCreatorInfo<C>[] = data.map((item: Post<C>) => {
			const userInfo = publicUserInfos[item.creatorId] ?? getDefaultUserInfo(item.creatorId);

			return {
				...item,
				creatorDisplayName: userInfo.displayName,
				creatorIslandName: userInfo.islandName,
				creatorPhotoURL: userInfo.photoURL,
			} as PostWithCreatorInfo<C>;
		});

		return populatedData ?? [];
	};

	return useInfiniteQuery<
		PostWithCreatorInfo<C>[], // TQueryFnData: 한 페이지당 반환되는 아이템 배열
		Error, // TError: 에러 타입
		InfiniteData<PostWithCreatorInfo<C>[]>, // TData: 최종 반환 데이터 타입
		[string, C, string] // TQueryKey: 쿼리키 타입
	>({
		queryKey: ['keywordSearch', collectionName, keyword],
		queryFn: ({ pageParam }) => searchPostsByCursor({ pageParam: pageParam as number }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.length === PAGE_SIZE ? allPages.length : undefined,
		enabled: keyword.length > 0,
	});
};

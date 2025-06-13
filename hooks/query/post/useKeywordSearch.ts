// src/hooks/query/useKeywordSearch.ts
import { searchClient } from '@/fbase';
import { getPublicUserInfos } from '@/firebase/services/userService';
import type { Collection, Post, PostWithCreatorInfo } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';

const PAGE_SIZE = 10;

export const useKeywordSearch = <C extends Collection>({
	collectionName,
	keyword,
}: {
	collectionName: C;
	keyword: string;
}) => {
	const searchPostsByCursor = async ({
		pageParam = 0,
	}): Promise<PostWithCreatorInfo<C>[]> => {
		const { results } = await searchClient.search({
			requests: [
				{
					indexName: collectionName,
					query: keyword,
					hitsPerPage: PAGE_SIZE,
					page: pageParam, // 시작 페이지 번호
					filters: 'isDeleted:false',
				},
			],
		});

		const data: Post<C>[] = results[0].hits.map((hit) => ({
			id: hit.objectID,
			type: hit.type,
			title: hit.title,
			body: hit.body,
			creatorId: hit.creatorId,
			createdAt: Timestamp.fromMillis(hit.createdAt as number),
			updatedAt: Timestamp.fromMillis(hit.updatedAt as number),
			commentCount: hit.commentCount,
			cart: hit.cart,
			images: hit.images,
		}));

		// CreatorInfo 병합
		const uniqueCreatorIds: string[] = Array.from(
			new Set(data.map((item: Post<C>) => item.creatorId)),
		);
		const publicUserInfos: Record<string, PublicUserInfo> =
			await getPublicUserInfos(uniqueCreatorIds);
		const populatedData: PostWithCreatorInfo<C>[] = data.map(
			(item: Post<C>) => {
				const userInfo =
					publicUserInfos[item.creatorId] || getDefaultUserInfo(item.creatorId);

				return {
					...item,
					creatorDisplayName: userInfo.displayName,
					creatorIslandName: userInfo.islandName,
					creatorPhotoURL: userInfo.photoURL,
				} as PostWithCreatorInfo<C>;
			},
		);

		return populatedData ?? [];
	};

	return useInfiniteQuery<
		PostWithCreatorInfo<C>[], // TQueryFnData: 한 페이지당 반환되는 아이템 배열
		Error, // TError: 에러 타입
		InfiniteData<PostWithCreatorInfo<C>[]>, // TData: 최종 반환 데이터 타입
		[string, C, string] // TQueryKey: 쿼리키 타입
	>({
		queryKey: ['keywordSearch', collectionName, keyword],
		queryFn: ({ pageParam }) =>
			searchPostsByCursor({ pageParam: pageParam as number }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.length === PAGE_SIZE ? allPages.length : undefined,
		enabled: keyword.length > 0,
	});
};

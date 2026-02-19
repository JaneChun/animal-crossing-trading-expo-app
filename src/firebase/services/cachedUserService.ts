import { QueryClient } from '@tanstack/react-query';
import { PublicUserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { getPublicUserInfos } from './userService';
import { PUBLIC_USER_INFO_STALE_TIME } from '@/constants/profile';

export const publicUserInfoQueryKey = (userId: string) => ['publicUserInfo', userId];

// TanStack Query 캐시를 활용한 유저 프로필 배치 조회
// - 캐시에 있고 stale하지 않은 유저는 스킵
// - uncached/stale 유저만 getPublicUserInfos로 배치 조회
// - 결과를 개별 키(['publicUserInfo', id])로 캐싱하여 앱 전체에서 공유
export const getCachedPublicUserInfos = async ({
	userIds,
	queryClient,
}: {
	userIds: string[];
	queryClient: QueryClient;
}): Promise<Record<string, PublicUserInfo>> => {
	if (userIds.length === 0) return {};

	const now = Date.now();
	const result: Record<string, PublicUserInfo> = {};
	const uncachedIds: string[] = [];

	userIds.forEach((id) => {
		// 캐시 키의 상태 가져오기
		const state = queryClient.getQueryState<PublicUserInfo>(publicUserInfoQueryKey(id));

		// 캐시된 데이터가 있고, 캐시된 시간이 STALE_TIME 이내라면 캐시 히트
		if (state?.data && now - state.dataUpdatedAt < PUBLIC_USER_INFO_STALE_TIME) {
			result[id] = state.data;
		} else {
			uncachedIds.push(id);
		}
	});

	if (uncachedIds.length > 0) {
		const freshUserInfos = await getPublicUserInfos(uncachedIds);

		uncachedIds.forEach((id) => {
			const userInfo = freshUserInfos[id] ?? getDefaultUserInfo(id);
			// 캐시 키에 데이터를 직접 주입
			queryClient.setQueryData(publicUserInfoQueryKey(id), userInfo);
			result[id] = userInfo;
		});
	}

	return result;
};

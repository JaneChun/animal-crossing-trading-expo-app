import { getPublicUserInfo } from '@/firebase/services/userService';
import { publicUserInfoQueryKey } from '@/firebase/services/cachedUserService';
import { PublicUserInfo } from '@/types/user';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const PUBLIC_USER_INFO_STALE_TIME = 30 * 60 * 1000;

export const useCachedPublicUserInfo = (
	userId: string | null | undefined,
	options?: Omit<UseQueryOptions<PublicUserInfo>, 'queryKey' | 'queryFn'>,
) => {
	return useQuery<PublicUserInfo>({
		queryKey: publicUserInfoQueryKey(userId!),
		queryFn: () => getPublicUserInfo(userId!),
		// options.enabled가 명시적으로 false면 false 사용
		enabled: options?.enabled !== undefined ? options.enabled : !!userId,
		staleTime: PUBLIC_USER_INFO_STALE_TIME,
		...options,
	});
};

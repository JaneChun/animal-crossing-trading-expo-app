import { getPublicUserInfo } from '@/firebase/services/userService';
import { publicUserInfoQueryKey } from '@/firebase/services/cachedUserService';
import { PublicUserInfo } from '@/types/user';
import { useQuery } from '@tanstack/react-query';
import { PUBLIC_USER_INFO_STALE_TIME } from '@/constants/profile';

export const useCachedPublicUserInfo = (userId: string | null | undefined) => {
	return useQuery<PublicUserInfo>({
		queryKey: publicUserInfoQueryKey(userId!),
		queryFn: () => getPublicUserInfo(userId!),
		enabled: !!userId,
		staleTime: PUBLIC_USER_INFO_STALE_TIME,
	});
};

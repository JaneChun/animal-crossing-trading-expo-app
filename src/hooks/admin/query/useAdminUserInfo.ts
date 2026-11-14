import { useQuery } from '@tanstack/react-query';

import { getUserInfo } from '@/firebase/services/userService';

export const adminUserInfoQueryKey = (uid: string) => ['adminUser', uid] as const;

// 관리자 화면용 전체 유저 정보(이메일·로그인 방식 포함). 탈퇴한 유저는 null
export const useAdminUserInfo = (uid: string | null | undefined) => {
	return useQuery({
		queryKey: adminUserInfoQueryKey(uid ?? ''),
		queryFn: () => getUserInfo(uid!),
		enabled: !!uid,
		staleTime: 0,
	});
};

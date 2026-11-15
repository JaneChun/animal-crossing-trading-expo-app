import { useQuery } from '@tanstack/react-query';

import { searchUsersByDisplayName } from '@/firebase/services/adminService';

// 유저 목록 검색: 닉네임 앞부분이 맞는 유저. 검색어가 비면 조회하지 않는다
export const useAdminUserSearch = (keyword: string) => {
	return useQuery({
		queryKey: ['adminUserSearch', keyword],
		queryFn: () => searchUsersByDisplayName(keyword),
		enabled: !!keyword,
	});
};

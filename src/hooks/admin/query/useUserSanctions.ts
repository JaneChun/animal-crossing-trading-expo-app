import { useQuery } from '@tanstack/react-query';

import { fetchUserSanctions } from '@/firebase/services/adminService';

export const userSanctionsQueryKey = (uid: string) => ['adminUserSanctions', uid] as const;

export const useUserSanctions = (uid: string) => {
	return useQuery({
		queryKey: userSanctionsQueryKey(uid),
		queryFn: () => fetchUserSanctions(uid),
		enabled: !!uid,
		staleTime: 0,
	});
};

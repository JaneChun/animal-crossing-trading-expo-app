import { useQuery } from '@tanstack/react-query';

import { fetchMySanctions } from '@/firebase/services/sanctionService';

export const mySanctionsQueryKey = (uid: string) => ['mySanctions', uid] as const;

export const useMySanctions = (uid: string | undefined) => {
	return useQuery({
		queryKey: mySanctionsQueryKey(uid ?? ''),
		queryFn: () => fetchMySanctions(uid!),
		enabled: !!uid,
	});
};

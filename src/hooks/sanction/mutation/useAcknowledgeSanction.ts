import { useMutation, useQueryClient } from '@tanstack/react-query';

import { acknowledgeSanction } from '@/firebase/services/sanctionService';

import { mySanctionsQueryKey } from '../query/useMySanctions';

export const useAcknowledgeSanction = (uid: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (sanctionId: string) => acknowledgeSanction(sanctionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: mySanctionsQueryKey(uid) });
		},
	});
};

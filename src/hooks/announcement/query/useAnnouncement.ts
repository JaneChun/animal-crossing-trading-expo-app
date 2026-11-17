import { useQuery } from '@tanstack/react-query';

import { fetchAnnouncement } from '@/firebase/services/announcementService';

export const announcementQueryKey = (id: string) => ['announcement', id] as const;

export const useAnnouncement = (id: string) => {
	return useQuery({
		queryKey: announcementQueryKey(id),
		queryFn: () => fetchAnnouncement(id),
		enabled: !!id,
	});
};

import { useQuery } from '@tanstack/react-query';

import { fetchAdminAnnouncements } from '@/firebase/services/announcementService';

export const adminAnnouncementsQueryKey = (hidden: boolean) =>
	['adminAnnouncements', hidden] as const;

export const useAdminAnnouncements = (hidden: boolean) => {
	return useQuery({
		queryKey: adminAnnouncementsQueryKey(hidden),
		queryFn: () => fetchAdminAnnouncements(hidden),
	});
};

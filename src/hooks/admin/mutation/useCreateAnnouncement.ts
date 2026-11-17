import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { createAnnouncement } from '@/firebase/services/announcementService';
import { announcementsQueryKey } from '@/hooks/announcement/query/useAnnouncements';
import { AnnouncementInput } from '@/types/announcement';

export const useCreateAnnouncement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: AnnouncementInput) => createAnnouncement(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: announcementsQueryKey });
			queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
			showToast('success', '공지가 작성되었습니다.');
		},
		onError: () => showToast('error', '공지 작성 중 오류가 발생했습니다.'),
	});
};

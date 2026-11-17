import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { updateAnnouncement } from '@/firebase/services/announcementService';
import { announcementQueryKey } from '@/hooks/announcement/query/useAnnouncement';
import { announcementsQueryKey } from '@/hooks/announcement/query/useAnnouncements';
import { AnnouncementInput } from '@/types/announcement';

export const useUpdateAnnouncement = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: AnnouncementInput) => updateAnnouncement({ id, input }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: announcementsQueryKey });
			queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
			queryClient.invalidateQueries({ queryKey: announcementQueryKey(id) });
			showToast('success', '공지가 수정되었습니다.');
		},
		onError: () => showToast('error', '공지 수정 중 오류가 발생했습니다.'),
	});
};

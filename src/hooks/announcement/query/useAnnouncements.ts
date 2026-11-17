import { useQuery } from '@tanstack/react-query';

import { fetchPublishedAnnouncements } from '@/firebase/services/announcementService';

export const announcementsQueryKey = ['announcements'] as const;

// 게시 중 공지 (마켓·커뮤니티 목록 상단 공지 줄). 실시간 구독 없이 조회만 한다
export const useAnnouncements = () => {
	return useQuery({
		queryKey: announcementsQueryKey,
		queryFn: fetchPublishedAnnouncements,
	});
};

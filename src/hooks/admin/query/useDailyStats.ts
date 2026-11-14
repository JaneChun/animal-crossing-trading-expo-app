import { useQuery } from '@tanstack/react-query';

import { fetchDailyStats } from '@/firebase/services/adminService';
import { getKstDateString } from '@/utilities/kstDate';

const ONE_MINUTE = 1000 * 60;

// 지난 날짜는 값이 바뀌지 않으므로 앱을 끄기 전까지 다시 요청하지 않는다.
// 앱 기본 gcTime(10분)이 지나면 캐시가 지워지므로 gcTime도 함께 늘린다. 디스크 영속화는 하지 않는다
export const useDailyStats = (date: string) => {
	const isToday = date === getKstDateString(new Date());

	return useQuery({
		queryKey: ['adminDailyStats', date],
		queryFn: () => fetchDailyStats(date),
		staleTime: isToday ? ONE_MINUTE : Infinity,
		// undefined를 넘기면 앱 기본값이 아니라 라이브러리 기본값으로 덮이므로 지난 날짜일 때만 넘긴다
		...(!isToday && { gcTime: Infinity }),
	});
};

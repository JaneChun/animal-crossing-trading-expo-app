import { db } from '@/fbase';
import { fetchAndPopulateSenderInfo } from '@/firebase/services/notificationService';
import { useAuthStore } from '@/stores/AuthStore';
import { useNotificationCountStore } from '@/stores/NotificationCountStore';
import { Collection } from '@/types/components';
import {
	Notification,
	NotificationWithReceiverInfo,
	NotificationWithSenderInfo,
} from '@/types/notification';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
	collection,
	onSnapshot,
	orderBy,
	query,
	Query,
	where,
} from 'firebase/firestore';
import { useEffect, useMemo } from 'react';

export const useNotifications = (collectionName?: Collection) => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const queryClient = useQueryClient();

	const setUnreadCount = useNotificationCountStore((state) => state.setCount);

	// 쿼리 객체 메모이제이션
	const q = useMemo(() => {
		if (!userInfo) return null;

		let q: Query = query(
			collection(db, 'Notifications'),
			where('receiverId', '==', userInfo.uid), // 내가 수신한 알림
			orderBy('createdAt', 'desc'), // 최신순 정렬
		);

		if (collectionName) {
			q = query(q, where('type', '==', collectionName));
		}

		return q;
	}, [userInfo, collectionName]);

	// fetcher
	const fetchNotifications = async () => {
		if (!userInfo || !q) return [];

		const { data = [] } = await fetchAndPopulateSenderInfo<
			Notification,
			NotificationWithSenderInfo
		>(q);

		// 안읽은 알림 수 계산 & 전역 상태에 저장
		const totalUnread = data.reduce(
			(acc: number, { isRead }: { isRead: boolean }) =>
				!isRead ? acc + 1 : acc,
			0,
		);
		setUnreadCount(totalUnread);

		return data;
	};

	const { data = [], isLoading } = useQuery<NotificationWithReceiverInfo[]>({
		queryKey: ['notifications', userInfo?.uid, collectionName],
		queryFn: fetchNotifications,
		enabled: !!userInfo && !!q,
		initialData: [],
	});

	useEffect(() => {
		if (!userInfo || !q) return;

		// 변경 감지 -> 데이터 리페칭하도록 캐시 무효화
		const unsubscribe = onSnapshot(q, () => {
			queryClient.invalidateQueries({
				queryKey: ['notifications', userInfo.uid, collectionName],
			});
		});

		return () => unsubscribe();
	}, [userInfo, collectionName]);

	return { data, isLoading };
};

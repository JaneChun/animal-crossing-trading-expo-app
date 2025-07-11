import { db } from '@/fbase';
import { fetchAndPopulateSenderInfo } from '@/firebase/services/notificationService';
import { useUserInfo } from '@/stores/auth';
import { Notification, PopulatedNotification } from '@/types/notification';
import {
	collection,
	onSnapshot,
	orderBy,
	Query,
	query,
	where,
} from 'firebase/firestore';
import { useEffect } from 'react';
import { useNotificationStore } from './store';

export const useNotificationSubscriptionInitializer = () => {
	const userInfo = useUserInfo();
	const { setNotifications, setUnreadCount, setIsLoading, clearNotifications } =
		useNotificationStore();

	// 알림 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) {
			clearNotifications();
			return;
		}

		const q: Query = query(
			collection(db, 'Notifications'),
			where('receiverId', '==', userInfo.uid), // 내가 수신한 알림
			orderBy('createdAt', 'desc'), // 최신순 정렬
		);

		const unsubscribe = onSnapshot(
			q,
			async () => {
				setIsLoading(true);

				try {
					const { data = [] } = await fetchAndPopulateSenderInfo<
						Notification,
						PopulatedNotification
					>(q);

					setNotifications(data);

					// 안읽은 알림 수 계산 & 전역 상태에 저장
					const totalUnread = data.reduce(
						(acc: number, { isRead }: { isRead: boolean }) =>
							!isRead ? acc + 1 : acc,
						0,
					);
					setUnreadCount(totalUnread);
				} catch (error) {
					console.warn('⚠️ NotificationStore 데이터 fetch 에러:', error);
				} finally {
					setIsLoading(false);
				}
			},
			(error) => {
				console.warn('⚠️ NotificationStore 구독 에러:', error);
				setIsLoading(false);
			},
		);

		return () => unsubscribe();
	}, [
		userInfo,
		setNotifications,
		setUnreadCount,
		setIsLoading,
		clearNotifications,
	]);
};

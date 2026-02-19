import { db } from '@/config/firebase';
import { populateSenderInfo } from '@/firebase/services/notificationService';
import { useUserInfo } from '@/stores/auth';
import { Notification } from '@/types/notification';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from './store';

export const useNotificationSubscriptionInitializer = () => {
	const userInfo = useUserInfo();
	const queryClient = useQueryClient();
	const { setNotifications, setUnreadCount, setIsLoading, clearNotifications } =
		useNotificationStore();

	// 알림 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) {
			clearNotifications();
			return;
		}

		const q = query(
			collection(db, 'Notifications'),
			where('receiverId', '==', userInfo.uid), // 내가 수신한 알림
			orderBy('createdAt', 'desc'), // 최신순 정렬
		);

		const unsubscribe = onSnapshot(
			q,
			async (snapshot) => {
				setIsLoading(true);

				try {
					const notifications: Notification[] = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					})) as Notification[];

					const populatedNotifications = await populateSenderInfo({
						notifications,
						queryClient,
					});

					setNotifications(populatedNotifications);

					// 안읽은 알림 수 계산 & 전역 상태에 저장
					const totalUnread = populatedNotifications.reduce(
						(acc: number, { isRead }: { isRead: boolean }) => (!isRead ? acc + 1 : acc),
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
	}, [userInfo, setNotifications, setUnreadCount, setIsLoading, clearNotifications]);
};

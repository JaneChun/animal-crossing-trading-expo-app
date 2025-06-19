import { db } from '@/fbase';
import { fetchAndPopulate } from '@/firebase/services/notificationService';
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
import { create } from 'zustand';
import { useAuthStore } from './AuthStore';

interface NotificationStoreState {
	notifications: PopulatedNotification[];
	setNotifications: (n: PopulatedNotification[]) => void;
	unreadCount: number;
	setUnreadCount: (n: number) => void;
	isLoading: boolean;
	setIsLoading: (b: boolean) => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
	notifications: [],
	setNotifications: (n) => set({ notifications: n }),
	unreadCount: 0,
	setUnreadCount: (n) => set({ unreadCount: n }),
	isLoading: false,
	setIsLoading: (b) => set({ isLoading: b }),
}));

export const useNotificationSubscriptionInitializer = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const setNotifications = useNotificationStore(
		(state) => state.setNotifications,
	);
	const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
	const setIsLoading = useNotificationStore((state) => state.setIsLoading);

	// 알림 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) {
			setNotifications([]);
			setUnreadCount(0);
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

				const { data = [] } = await fetchAndPopulate<
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

				setIsLoading(false);
			},
			(e) => {
				if (e.code === 'permission-denied') {
					console.warn(
						'⚠️ Firestore 권한 에러: Notifications 리스너 접근 불가',
					);
				}
			},
		);

		return () => unsubscribe();
	}, [userInfo?.uid]);
};

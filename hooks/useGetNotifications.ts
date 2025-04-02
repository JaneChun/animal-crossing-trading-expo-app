import { db } from '@/fbase';
import { fetchMyNotifications } from '@/firebase/services/notificationService';
import { useAuthStore } from '@/stores/AuthStore';
import { Collection } from '@/types/components';
import {
	Notification,
	NotificationWithReceiverInfo,
} from '@/types/notification';
import {
	collection,
	onSnapshot,
	orderBy,
	query,
	where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

const useGetNotifications = (collectionName?: Collection) => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const [notifications, setNotifications] = useState<
		NotificationWithReceiverInfo[]
	>([]);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// 알림 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) {
			setNotifications([]);
			setUnreadCount(0);
			setIsLoading(false);
			return;
		}

		let q = query(
			collection(db, 'Notifications'),
			where('receiverId', '==', userInfo.uid), // 내가 수신한 알림
			orderBy('createdAt', 'desc'), // 최신순 정렬
		);

		if (collectionName) {
			q = query(q, where('type', '==', collectionName));
		}

		const unsubscribe = onSnapshot(q, async (snapshot) => {
			setIsLoading(true);

			const { data } = await fetchMyNotifications<
				Notification,
				NotificationWithReceiverInfo
			>(q, userInfo.uid);
			setNotifications(data);
			getSumOfUnreadNotification(data);

			setIsLoading(false);
		});

		return () => unsubscribe();
	}, [userInfo, collectionName]);

	const getSumOfUnreadNotification = async (
		notifications: NotificationWithReceiverInfo[],
	) => {
		if (!userInfo) return;

		const sum = notifications.reduce(
			(acc: number, { isRead }) => (isRead ? acc : acc + 1),
			0,
		);
		setUnreadCount(sum);
	};

	return { notifications, unreadCount, isLoading };
};

export default useGetNotifications;

import { db } from '@/fbase';
import { fetchAndPopulateSenderInfo } from '@/firebase/services/notificationService';
import { useAuthStore } from '@/stores/AuthStore';
import { useNotificationCountStore } from '@/stores/NotificationCountStore';
import { Collection } from '@/types/components';
import {
	Notification,
	NotificationWithReceiverInfo,
} from '@/types/notification';
import {
	collection,
	onSnapshot,
	orderBy,
	Query,
	query,
	where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

const useGetNotifications = (collectionName?: Collection) => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const [notifications, setNotifications] = useState<
		NotificationWithReceiverInfo[]
	>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const setUnreadCount = useNotificationCountStore((state) => state.setCount);

	// 알림 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) {
			setNotifications([]);
			setIsLoading(false);
			setUnreadCount(0);
			return;
		}

		let q: Query = query(
			collection(db, 'Notifications'),
			where('receiverId', '==', userInfo.uid), // 내가 수신한 알림
			orderBy('createdAt', 'desc'), // 최신순 정렬
		);

		if (collectionName) {
			q = query(q, where('type', '==', collectionName));
		}

		const unsubscribe = onSnapshot(q, async () => {
			setIsLoading(true);

			const { data = [] } = await fetchAndPopulateSenderInfo<
				Notification,
				NotificationWithReceiverInfo
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
		});

		return () => unsubscribe();
	}, [userInfo, collectionName]);

	return { notifications, isLoading };
};

export default useGetNotifications;

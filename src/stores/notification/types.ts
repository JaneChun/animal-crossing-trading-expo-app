import { PopulatedNotification } from '@/types/notification';

export interface NotificationStoreState {
	notifications: PopulatedNotification[];
	setNotifications: (n: PopulatedNotification[]) => void;
	unreadCount: number;
	setUnreadCount: (n: number) => void;
	isLoading: boolean;
	setIsLoading: (b: boolean) => void;
}

export interface NotificationActions {
	clearNotifications: () => void;
	resetStore: () => void;
}

export interface NotificationStore
	extends NotificationStoreState,
		NotificationActions {}

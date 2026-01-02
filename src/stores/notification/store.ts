import { create } from 'zustand';
import { NotificationStore } from './types';

export const useNotificationStore = create<NotificationStore>((set) => ({
	notifications: [],
	setNotifications: (n) => set({ notifications: n }),
	unreadCount: 0,
	setUnreadCount: (n) => set({ unreadCount: n }),
	isLoading: false,
	setIsLoading: (b) => set({ isLoading: b }),

	// Actions
	clearNotifications: () => {
		set({ notifications: [], unreadCount: 0 });
	},

	resetStore: () => {
		set({
			notifications: [],
			unreadCount: 0,
			isLoading: false,
		});
	},
}));

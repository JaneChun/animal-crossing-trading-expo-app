import { create } from 'zustand';
import { PushNotificationStore } from './types';

export const usePushNotificationStore = create<PushNotificationStore>(
	(set) => ({
		expoPushToken: null,
		notification: null,
		error: null,
		setExpoPushToken: (token) => set({ expoPushToken: token }),
		setNotification: (notification) => set({ notification }),
		setError: (error) => set({ error }),

		// Actions
		resetStore: () => {
			set({
				expoPushToken: null,
				notification: null,
				error: null,
			});
		},
	}),
);

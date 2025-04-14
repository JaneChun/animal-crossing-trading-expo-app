import { create } from 'zustand';

interface NotificationCountState {
	count: number;
	setCount: (n: number) => void;
}

export const useNotificationCountStore = create<NotificationCountState>(
	(set) => ({
		count: 0,
		setCount: (n) => set({ count: n }),
	}),
);

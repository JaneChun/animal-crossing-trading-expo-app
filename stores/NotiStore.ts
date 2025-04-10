import { create } from 'zustand';

interface NotiState {
	count: number;
	setCount: (n: number) => void;
	increment: () => void;
	clear: () => void;
}

export const useNotiStore = create<NotiState>((set) => ({
	count: 0,
	setCount: (n) => set({ count: n }),
	increment: () => set((s) => ({ count: s.count + 1 })),
	clear: () => set({ count: 0 }),
}));

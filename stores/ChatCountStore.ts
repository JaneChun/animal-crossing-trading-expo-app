import { create } from 'zustand';

interface ChatCountState {
	count: number;
	setCount: (n: number) => void;
}

export const useChatCountStore = create<ChatCountState>((set) => ({
	count: 0,
	setCount: (n) => set({ count: n }),
}));

import { create } from 'zustand';
import { BlockStore } from './types';

export const useBlockStore = create<BlockStore>((set) => ({
	blockedUsers: [],
	blockedBy: [],
	isLoading: false,
	setBlockedUsers: (ids: string[]) => set({ blockedUsers: ids }),
	setBlockedBy: (ids: string[]) => set({ blockedBy: ids }),
	setIsLoading: (b: boolean) => set({ isLoading: b }),

	// Actions
	clearBlocks: () => {
		set({ blockedUsers: [], blockedBy: [] });
	},

	resetStore: () => {
		set({
			blockedUsers: [],
			blockedBy: [],
			isLoading: false,
		});
	},
}));
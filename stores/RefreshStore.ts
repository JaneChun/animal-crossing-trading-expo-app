import { create } from 'zustand';

type RefreshState = {
	shouldRefreshPostList: boolean;
	shouldRefreshPostDetail: boolean;
	setRefreshPostList: (value: boolean) => void;
	setRefreshPostDetail: (value: boolean) => void;
};

export const useRefreshStore = create<RefreshState>((set) => ({
	shouldRefreshPostList: false,
	shouldRefreshPostDetail: false,
	setRefreshPostList: (value) => set({ shouldRefreshPostList: value }),
	setRefreshPostDetail: (value) => set({ shouldRefreshPostDetail: value }),
}));

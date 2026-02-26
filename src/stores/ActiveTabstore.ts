import { create } from 'zustand';

import { Tab } from '@/types/post';

type ActiveTabState = {
	activeTab: Tab;
	setActiveTab: (tab: Tab) => void;
};

export const useActiveTabStore = create<ActiveTabState>((set) => ({
	activeTab: 'Home',
	setActiveTab: (tab) => set({ activeTab: tab }),
}));

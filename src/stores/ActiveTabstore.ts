import { Tab } from '@/types/post';
import { create } from 'zustand';

type ActiveTabState = {
	activeTab: Tab;
	setActiveTab: (tab: Tab) => void;
};

export const useActiveTabStore = create<ActiveTabState>((set) => ({
	activeTab: 'Home',
	setActiveTab: (tab) => set({ activeTab: tab }),
}));

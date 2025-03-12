import { Tab } from '@/types/components';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type AppState = {
	activeTab: Tab;
	setActiveTab: (tab: Tab) => void;
};

export const useNavigationStore = create<AppState>()(
	immer((set) => ({
		activeTab: 'Home',
		setActiveTab: (tab) =>
			set((state) => {
				state.activeTab = tab;
			}),
	})),
);

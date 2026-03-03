import { create } from 'zustand';

import { AdState, DEFAULT_AD_CONFIG } from './types';

export const useAdStore = create<AdState>((set) => ({
	adConfig: DEFAULT_AD_CONFIG,
	setAdConfig: (config) => set({ adConfig: config }),
}));

export const useAdConfig = () => useAdStore((state) => state.adConfig);

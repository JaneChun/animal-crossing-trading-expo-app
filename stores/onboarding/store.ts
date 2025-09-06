import { create } from 'zustand';
import { OnboardingStoreState } from './types';

export const useOnboardingStore = create<OnboardingStoreState>((set) => ({
	hasCompletedOnboarding: false,
	setHasCompletedOnboarding: (b) => set({ hasCompletedOnboarding: b }),
	currentStep: 0,
	setCurrentStep: (n) => set({ currentStep: n }),
}));

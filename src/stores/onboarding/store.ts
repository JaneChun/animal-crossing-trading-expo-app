import { create } from 'zustand';
import { OnboardingStoreState } from './types';

export const useOnboardingStore = create<OnboardingStoreState>((set) => ({
	isLoading: true,
	setIsLoading: (loading) => set({ isLoading: loading }),
	hasCompletedOnboarding: false,
	setHasCompletedOnboarding: (b) => set({ hasCompletedOnboarding: b }),
	currentStep: 0,
	setCurrentStep: (n) => set({ currentStep: n }),
}));

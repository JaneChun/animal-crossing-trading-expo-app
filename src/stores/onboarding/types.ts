export interface OnboardingStoreState {
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
	hasCompletedOnboarding: boolean;
	setHasCompletedOnboarding: (b: boolean) => void;
	currentStep: number;
	setCurrentStep: (n: number) => void;
}

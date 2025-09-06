export interface OnboardingStoreState {
	hasCompletedOnboarding: boolean;
	setHasCompletedOnboarding: (b: boolean) => void;
	currentStep: number;
	setCurrentStep: (n: number) => void;
}

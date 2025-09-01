import { useOnboardingStore } from './store';
import { getOnboardingStatus } from './utils/storage';

export const useOnboardingInitializer = async () => {
	const setHasCompletedOnboarding = useOnboardingStore.getState().setHasCompletedOnboarding;

	const hasCompletedOnboarding = await getOnboardingStatus();
	setHasCompletedOnboarding(hasCompletedOnboarding);
};

import { useEffect } from 'react';
import { useOnboardingStore } from './store';
import { getOnboardingStatus } from './utils/storage';

export const useOnboardingInitializer = () => {
	const { setIsLoading, setHasCompletedOnboarding } = useOnboardingStore.getState();

	useEffect(() => {
		const loadOnboardingStatus = async () => {
			setIsLoading(true);

			const hasCompletedOnboarding = await getOnboardingStatus();
			setHasCompletedOnboarding(hasCompletedOnboarding);

			setIsLoading(false);
		};

		loadOnboardingStatus();
	}, [setHasCompletedOnboarding, setIsLoading]);
};

import analytics from '@react-native-firebase/analytics';

let firebaseAnalytics: ReturnType<typeof analytics> | null = null;

const getAnalytics = () => {
	if (!firebaseAnalytics) {
		firebaseAnalytics = analytics();
	}
	return firebaseAnalytics;
};

export const logScreenView = async (screenName: string, screenClass?: string) => {
	if (__DEV__) return;

	await getAnalytics().logEvent('screen_view', {
		screen_name: screenName,
		screen_class: screenClass ?? screenName,
	});
};

import analytics from '@react-native-firebase/analytics';

export const firebaseAnalytics = analytics();

export const logScreenView = async (screenName: string, screenClass?: string) => {
	if (__DEV__) return;

	await firebaseAnalytics.logEvent('screen_view', {
		screen_name: screenName,
		screen_class: screenClass ?? screenName,
	});
};

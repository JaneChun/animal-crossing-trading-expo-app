import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_STORAGE_KEY = '@onboarding_completed';

export const getOnboardingStatus = async (): Promise<boolean> => {
	try {
		const status = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
		return status === 'true';
	} catch (error) {
		console.log('AsyncStorage 온보딩 상태 불러오기 실패:', error);
		return false;
	}
};

export const saveOnboardingAsCompleted = async () => {
	try {
		await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
	} catch (error) {
		console.log('AsyncStorage 온보딩 완료 상태 저장 실패:', error);
	}
};

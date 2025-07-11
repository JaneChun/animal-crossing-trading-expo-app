import { UserInfo } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStorageData } from '../types';

const USER_STORAGE_KEY = '@user';

export const getUserFromStorage = async (): Promise<UserInfo | null> => {
	try {
		const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);

		if (!storedUser) {
			return null;
		}

		const parsedUser = JSON.parse(storedUser) as AuthStorageData;

		// 저장된 정보가 유효한 형식인지 검증
		if (!parsedUser.uid || typeof parsedUser.uid !== 'string') {
			await clearUserStorage();
			return null;
		}

		return parsedUser as UserInfo;
	} catch (error) {
		console.log('AsyncStorage 유저 파싱 실패:', error);
		await clearUserStorage();
		return null;
	}
};

export const saveUserToStorage = async (userInfo: UserInfo): Promise<void> => {
	try {
		await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userInfo));
	} catch (error) {
		console.error('AsyncStorage 유저 동기화 실패:', error);
		throw error;
	}
};

export const clearUserStorage = async (): Promise<void> => {
	try {
		await AsyncStorage.removeItem(USER_STORAGE_KEY);
	} catch (error) {
		console.error('AsyncStorage 유저 초기화 실패:', error);
		throw error;
	}
};

export const isUserDataValid = (userData: any): userData is UserInfo => {
	return (
		userData &&
		typeof userData === 'object' &&
		userData.uid &&
		typeof userData.uid === 'string'
	);
};

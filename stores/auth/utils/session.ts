import { updateLastLogin } from '@/firebase/services/authService';
import { getUserInfo } from '@/firebase/services/userService';
import { UserInfo } from '@/types/user';
import { auth } from '../../../fbase';
import firebaseRequest from '../../../firebase/core/firebaseInterceptor';
import { AuthStateManager } from '../types';
import { clearUserStorage, saveUserToStorage } from './storage';

// 로딩 상태 관리 wrapper
export const executeWithLoading = async <T>(
	operation: () => Promise<T>,
	stateManager: AuthStateManager,
	requestName: string,
): Promise<T | null> => {
	stateManager.setIsAuthLoading(true);

	try {
		const result = await firebaseRequest(requestName, operation);

		return result;
	} finally {
		stateManager.setIsAuthLoading(false);
	}
};

// 로그인 성공 후 처리
export const handleSuccessfulLogin = async (
	user: any,
	stateManager: AuthStateManager,
): Promise<{ isNewUser: boolean }> => {
	const userInfo = await getUserInfo(user.uid);

	// 신규 유저
	if (!userInfo) {
		return { isNewUser: true };
	}

	// 기존 유저 - 로그인 시간 업데이트 및 상태 동기화
	await updateLastLogin(userInfo.uid);
	await updateUserSession(userInfo, stateManager);

	return { isNewUser: false };
};

// 사용자 세션 업데이트
export const updateUserSession = async (
	userInfo: UserInfo,
	stateManager: AuthStateManager,
): Promise<void> => {
	stateManager.setUserInfo(userInfo);
	await saveUserToStorage(userInfo);
};

// 사용자 세션 초기화
export const clearUserSession = async (
	stateManager: AuthStateManager,
): Promise<void> => {
	stateManager.setUserInfo(null);
	await clearUserStorage();
};

// Firebase 로그아웃
export const signOutFromFirebase = async (): Promise<void> => {
	await auth.signOut();
};

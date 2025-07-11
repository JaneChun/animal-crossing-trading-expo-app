import { create } from 'zustand';
import { AppleAuthProvider } from './providers/apple';
import { KakaoAuthProvider } from './providers/kakao';
import { NaverAuthProvider } from './providers/naver';
import { AuthState, AuthStateManager } from './types';

export const useAuthStore = create<AuthState>((set, get) => {
	// Provider 클래스가 Zustand 스토어(AuthState)를 직접 알 필요 없이 상태를 조작할 수 있게 해주는 인터페이스
	const stateManager: AuthStateManager = {
		getUserInfo: () => get().userInfo,
		setUserInfo: (user) => set({ userInfo: user }),
		getIsAuthLoading: () => get().isAuthLoading,
		setIsAuthLoading: (loading) => set({ isAuthLoading: loading }),
	};

	// Provider 인스턴스, stateManager를 인자로 전달
	const kakaoProvider = new KakaoAuthProvider(stateManager);
	const naverProvider = new NaverAuthProvider(stateManager);
	const appleProvider = new AppleAuthProvider(stateManager);

	return {
		userInfo: null,
		setUserInfo: stateManager.setUserInfo,
		isAuthLoading: false,
		setIsAuthLoading: stateManager.setIsAuthLoading,

		// Provider 메서드
		kakaoLogin: () => kakaoProvider.login(),
		kakaoLogout: () => kakaoProvider.logout(),
		kakaoDeleteAccount: () => kakaoProvider.deleteAccount(),

		naverLogin: () => naverProvider.login(),
		naverLogout: () => naverProvider.logout(),
		naverDeleteAccount: () => naverProvider.deleteAccount(),

		appleLogin: () => appleProvider.login(),
		appleLogout: () => appleProvider.logout(),
		appleDeleteAccount: () => appleProvider.deleteAccount(),
	};
});
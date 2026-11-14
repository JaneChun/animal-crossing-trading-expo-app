import { UserInfo } from '@/types/user';

export interface LoginResult {
	isSuccess: boolean;
	isNewUser: boolean;
	email: string;
}

export interface AuthState {
	userInfo: UserInfo | null;
	setUserInfo: (user: UserInfo | null) => void;
	// 앱 시작 시 로컬 저장소에서 유저 정보를 복원하는 중인지. 끝날 때까지 스플래시를 유지한다
	isUserLoading: boolean;
	setIsUserLoading: (loading: boolean) => void;
	isAuthLoading: boolean;
	setIsAuthLoading: (loading: boolean) => void;
	kakaoLogin: () => Promise<LoginResult>;
	kakaoLogout: () => Promise<boolean>;
	kakaoDeleteAccount: (uid: string) => Promise<boolean>;
	naverLogin: () => Promise<LoginResult>;
	naverLogout: () => Promise<boolean>;
	naverDeleteAccount: (uid: string) => Promise<boolean>;
	appleLogin: () => Promise<LoginResult>;
	appleLogout: () => Promise<boolean>;
	appleDeleteAccount: (uid: string) => Promise<boolean>;
	googleLogin: () => Promise<LoginResult>;
	googleLogout: () => Promise<boolean>;
	googleDeleteAccount: (uid: string) => Promise<boolean>;
}

export interface AuthProvider {
	login: () => Promise<LoginResult>;
	logout: () => Promise<boolean>;
	deleteAccount: (uid: string) => Promise<boolean>;
}

export interface ProviderSDKConfig {
	kakao: {
		iosKey: string;
	};
	naver: {
		appName: string;
		consumerKey: string;
		consumerSecret: string;
		serviceUrlSchemeIOS?: string;
		disableNaverAppAuthIOS: boolean;
	};
}

export type AuthProviderType = 'kakao' | 'naver' | 'apple' | 'google';

export interface AuthStateManager {
	getUserInfo: () => UserInfo | null;
	setUserInfo: (user: UserInfo | null) => void;
	getIsAuthLoading: () => boolean;
	setIsAuthLoading: (loading: boolean) => void;
}

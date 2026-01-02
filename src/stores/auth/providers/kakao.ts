import { loginWithKakao } from '@/firebase/services/authService';
import { isLogined, logout } from '@react-native-kakao/user';
import { auth } from '@/config/firebase';
import { AuthStateManager, LoginResult } from '../types';
import { BaseAuthProvider } from './base';

export class KakaoAuthProvider extends BaseAuthProvider {
	constructor(stateManager: AuthStateManager) {
		super(stateManager);
	}

	// 카카오 전용 로그인 구현
	async login(): Promise<LoginResult> {
		return this.executeLogin(async () => {
			const result = await loginWithKakao();
			return result;
		});
	}

	// 카카오 전용 로그아웃 구현
	async logout(): Promise<boolean> {
		if (!isLogined() || !auth.currentUser) {
			return false;
		}

		return this.executeLogout(async () => {
			await logout(); // 카카오 로그아웃
		});
	}

	// 특별한 추가 로직 없음
	async deleteAccount(): Promise<boolean> {
		if (!auth.currentUser) {
			return false;
		}

		return this.executeDeleteAccount(undefined);
	}
}

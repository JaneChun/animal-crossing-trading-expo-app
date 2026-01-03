import { loginWithNaver } from '@/firebase/services/authService';
import NaverLogin from '@react-native-seoul/naver-login';
import { auth } from '@/config/firebase';
import { AuthStateManager, LoginResult } from '@/types';
import { BaseAuthProvider } from './base';

export class NaverAuthProvider extends BaseAuthProvider {
	constructor(stateManager: AuthStateManager) {
		super(stateManager);
	}

	// 네이버 전용 로그인 구현
	async login(): Promise<LoginResult> {
		return this.executeLogin(async () => {
			const result = await loginWithNaver();
			return result;
		});
	}

	// 네이버 전용 로그아웃 구현
	async logout(): Promise<boolean> {
		if (!auth.currentUser) {
			return false;
		}

		return this.executeLogout(async () => {
			await NaverLogin.logout(); // 네이버 로그아웃
		});
	}

	// 회원탈퇴 시 네이버 토큰 삭제
	async deleteAccount(): Promise<boolean> {
		if (!auth.currentUser) {
			return false;
		}

		return this.executeDeleteAccount(async () => {
			await NaverLogin.deleteToken(); // 네이버 토큰 삭제
		});
	}
}

import NaverLogin from '@react-native-seoul/naver-login';

import { auth } from '@/config/firebase';
import { loginWithNaver } from '@/firebase/services/authService';
import { logLogin, logSignUp } from '@/utilities/analytics';

import { BaseAuthProvider } from './base';
import { LoginResult } from '../types';

export class NaverAuthProvider extends BaseAuthProvider {
	// 네이버 전용 로그인 구현
	async login(): Promise<LoginResult> {
		const result = await this.executeLogin(() => loginWithNaver());

		if (result.isSuccess) {
			if (result.isNewUser) {
				logSignUp('naver');
			} else {
				logLogin('naver');
			}
		}

		return result;
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

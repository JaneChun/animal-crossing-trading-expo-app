import { auth } from '@/config/firebase';
import { loginWithApple } from '@/firebase/services/authService';

import { BaseAuthProvider } from './base';
import { LoginResult } from '../types';

export class AppleAuthProvider extends BaseAuthProvider {
	// Apple 전용 로그인  구현
	async login(): Promise<LoginResult> {
		return this.executeLogin(async () => {
			const result = await loginWithApple();
			return result;
		});
	}

	// 특별한 추가 로직 없음
	async logout(): Promise<boolean> {
		if (!auth.currentUser) {
			return false;
		}

		return this.executeLogout(undefined);
	}

	// 특별한 추가 로직 없음
	async deleteAccount(): Promise<boolean> {
		if (!auth.currentUser) {
			return false;
		}

		return this.executeDeleteAccount(undefined);
	}
}

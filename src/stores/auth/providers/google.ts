import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { auth } from '@/config/firebase';
import { loginWithGoogle } from '@/firebase/services/authService';
import { logLogin, logSignUp } from '@/utilities/analytics';

import { BaseAuthProvider } from './base';
import { LoginResult } from '../types';

export class GoogleAuthProvider extends BaseAuthProvider {
	// Google 전용 로그인 구현
	async login(): Promise<LoginResult> {
		const result = await this.executeLogin(() => loginWithGoogle());

		if (result.isSuccess) {
			if (result.isNewUser) {
				logSignUp('google');
			} else {
				logLogin('google');
			}
		}

		return result;
	}

	// Google 전용 로그아웃 구현
	async logout(): Promise<boolean> {
		if (!auth.currentUser) {
			return false;
		}

		return this.executeLogout(async () => {
			await GoogleSignin.signOut(); // 다음 로그인 때 계정 선택 창이 다시 열리도록 세션 해제
		});
	}

	// 회원탈퇴 시 앱의 Google 접근 권한 철회
	async deleteAccount(): Promise<boolean> {
		if (!auth.currentUser) {
			return false;
		}

		return this.executeDeleteAccount(async () => {
			await GoogleSignin.revokeAccess();
		});
	}
}

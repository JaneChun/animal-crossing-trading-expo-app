import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';
import { AuthProvider, AuthStateManager, LoginResult } from '@/types';
import {
	clearUserSession,
	executeWithLoading,
	handleSuccessfulLogin,
	signOutFromFirebase,
} from '@/stores/auth/utils/session';

/**
 * 모든 소셜 로그인 provider들이 상속받는 기본 클래스
 *
 * 역할:
 * - 카카오, 네이버, 애플 등 각 provider에서 공통으로 필요한 기능을 제공
 * - 로그인/로그아웃/회원탈퇴의 기본 흐름을 정의
 * - 각 provider는 자신만의 특별한 로직만 구현하면 됨
 */
export abstract class BaseAuthProvider implements AuthProvider {
	protected stateManager: AuthStateManager;

	constructor(stateManager: AuthStateManager) {
		this.stateManager = stateManager;
	}

	// 추상 메서드들: 각 provider에서 반드시 구현해야 함
	abstract login(): Promise<LoginResult>;
	abstract logout(): Promise<boolean>;
	abstract deleteAccount(uid: string): Promise<boolean>;

	/**
	 * 로그인 공통 처리 로직
	 *
	 * @param providerLogin - 각 provider별 로그인 함수 (카카오, 네이버 등)
	 * @returns 로그인 결과 (성공여부, 신규 사용자여부, 이메일)
	 */
	protected async executeLogin(
		providerLogin: () => Promise<{ user: any; email: string } | null>,
	): Promise<LoginResult> {
		let isNewUser = false;
		let userEmail = '';

		// 로딩 상태를 보여주면서 로그인 처리
		const isSuccess = await executeWithLoading(
			async () => {
				// 1. provider별  소셜 로그인 실행
				const loginResult = await providerLogin();
				if (!loginResult) {
					return false;
				}

				// 2. 로그인 성공 시 사용자 정보 추출
				const { user, email } = loginResult;
				userEmail = email;

				// 3. Firebase 사용자 정보 처리 및 세션 생성
				const result = await handleSuccessfulLogin(user, this.stateManager);
				isNewUser = result.isNewUser;

				return true;
			},
			this.stateManager,
			'로그인',
		);

		return {
			isSuccess: isSuccess === true,
			isNewUser,
			email: userEmail,
		};
	}

	/**
	 * 로그아웃 공통 처리 로직
	 *
	 * @param providerLogout - 각 provider별 로그아웃 함수 (optional)
	 * @returns 로그아웃 성공 여부
	 */
	protected async executeLogout(
		providerLogout?: () => Promise<void>,
	): Promise<boolean> {
		// 현재 로그인한 사용자가 있는지 확인
		const userInfo = this.stateManager.getUserInfo();
		if (!userInfo) {
			return false;
		}

		// 로딩 상태를 보여주면서 로그아웃 처리
		const isSuccess = await executeWithLoading(
			async () => {
				// 1. provider별 로그아웃
				if (providerLogout) {
					await providerLogout();
				}

				// 2. Firebase 로그아웃
				await signOutFromFirebase();

				// 3. 앱 내 사용자 세션 정리 (상태 + 저장소)
				await clearUserSession(this.stateManager);

				return true;
			},
			this.stateManager,
			'로그아웃',
		);

		return isSuccess === true;
	}

	/**
	 * 회원탈퇴 공통 처리 로직
	 *
	 * @param providerDeleteAccount - provider별 추가 정리 작업 (optional)
	 * @returns 회원탈퇴 성공 여부
	 */
	protected async executeDeleteAccount(
		providerDeleteAccount?: () => Promise<void>,
	): Promise<boolean> {
		// 현재 로그인한 사용자가 있는지 확인
		const userInfo = this.stateManager.getUserInfo();
		if (!userInfo) {
			return false;
		}

		// 로딩 상태를 보여주면서 회원탈퇴 처리
		const isSuccess = await executeWithLoading(
			async () => {
				// 1. Firebase Cloud Function을 통해 사용자 데이터 삭제
				await httpsCallable(
					functions,
					'deleteUserAndArchive',
				)({ uid: userInfo.uid });

				// 2. provider별 회원탈퇴 (토큰 삭제 등)
				if (providerDeleteAccount) {
					await providerDeleteAccount();
				}

				// 3. 앱 내 사용자 세션 정리 (상태 + 저장소)
				await clearUserSession(this.stateManager);

				return true;
			},
			this.stateManager,
			'회원 탈퇴',
		);

		return isSuccess === true;
	}
}

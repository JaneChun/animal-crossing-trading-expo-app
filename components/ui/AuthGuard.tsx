import { useAuthStore } from '@/stores/AuthStore';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import { useEffect } from 'react';
import LoadingIndicator from './loading/LoadingIndicator';
import { showToast } from './Toast';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
	const { userInfo, isAuthLoading } = useAuthStore();

	useEffect(() => {
		if (!isAuthLoading && !userInfo) {
			navigateToLogin();
			showToast('info', '로그인 후 이용할 수 있습니다.');
		}
	}, [userInfo, isAuthLoading]);

	if (isAuthLoading || !userInfo) {
		return <LoadingIndicator />;
	}

	return <>{children}</>;
};

export default AuthGuard;

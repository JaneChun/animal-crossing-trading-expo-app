import { useAuthStore } from '@/stores/AuthStore';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import { useEffect } from 'react';
import EmptyIndicator from './EmptyIndicator';
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

	if (isAuthLoading) {
		return <LoadingIndicator />;
	}

	if (!userInfo) {
		return <EmptyIndicator message='접근 권한이 없습니다.' />;
	}

	return <>{children}</>;
};

export default AuthGuard;

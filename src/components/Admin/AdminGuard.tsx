import { useNavigation } from '@react-navigation/native';
import { ReactNode, useEffect } from 'react';

import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { useUserInfo } from '@/stores/auth';

// 관리자 화면 가드. 딥링크로 직접 들어온 일반 유저는 화면을 그리지 않고 뒤로 보낸다.
// 앱 시작 직후에는 저장소에서 유저 정보를 복원하기 전이라 null이므로, 그동안은 로딩만 보여 준다
const AdminGuard = ({ children }: { children: ReactNode }) => {
	const navigation = useNavigation();
	const userInfo = useUserInfo();
	const isAdmin = userInfo?.role === 'admin';
	const isNonAdminUser = !!userInfo && !isAdmin;

	useEffect(() => {
		if (!isNonAdminUser) return;

		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.reset({ index: 0, routes: [{ name: 'MainTab' as never }] });
		}
	}, [isNonAdminUser, navigation]);

	if (!isAdmin) return isNonAdminUser ? null : <LoadingIndicator />;

	return <>{children}</>;
};

export default AdminGuard;

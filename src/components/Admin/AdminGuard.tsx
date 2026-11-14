import { useNavigation } from '@react-navigation/native';
import { ReactNode, useEffect } from 'react';

import { useUserInfo } from '@/stores/auth';

// 관리자 화면 가드. 딥링크로 직접 들어온 일반 유저 또는 로그인 정보가 없다면 화면을 그리지 않고 뒤로 보낸다.
const AdminGuard = ({ children }: { children: ReactNode }) => {
	const navigation = useNavigation();
	const userInfo = useUserInfo();
	const isAdmin = userInfo?.role === 'admin';

	useEffect(() => {
		if (isAdmin) return;

		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.reset({ index: 0, routes: [{ name: 'MainTab' as never }] });
		}
	}, [isAdmin, navigation]);

	if (!isAdmin) return null;

	return <>{children}</>;
};

export default AdminGuard;

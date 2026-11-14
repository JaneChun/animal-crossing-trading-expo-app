import { useEffect } from 'react';

import { navigationRef, resetTo } from '@/navigation/RootNavigation';
import { useUserInfo } from '@/stores/auth';
import { isSuspended } from '@/utilities/sanction';

// 정지 중이면 정지 화면만 남긴다.
// 앱 시작 때는 RootStackNavigator의 initialRouteName이 정지 화면에서 시작하게 하고,
// 이 훅은 그 뒤의 모든 화면 이동(로그인 후 이동, 푸시·딥링크로 연 화면)을 감시해 정지 화면으로 되돌린다
export const useSuspensionGuard = () => {
	const userInfo = useUserInfo();
	const isUserSuspended = isSuspended(userInfo?.report?.suspendUntil);

	useEffect(() => {
		if (!isUserSuspended) return;

		const keepSuspendedScreen = () => {
			if (!navigationRef.isReady()) return;
			if (navigationRef.getCurrentRoute()?.name === 'Suspended') return;
			resetTo('Suspended');
		};

		keepSuspendedScreen();
		const unsubscribe = navigationRef.addListener('state', keepSuspendedScreen);
		return unsubscribe;
	}, [isUserSuspended]);
};

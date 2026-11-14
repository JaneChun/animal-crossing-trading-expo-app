import { useEffect } from 'react';

import { navigate, navigationRef } from '@/navigation/RootNavigation';
import { useUserInfo } from '@/stores/auth';
import { findUnacknowledgedWarning } from '@/utilities/sanction';

import { useMySanctions } from './query/useMySanctions';

// 확인하지 않은 경고가 있으면 경고 화면을 띄운다. 확인하면 목록이 갱신되어 다음 경고로 넘어간다
export const useSanctionWarningNotice = (enabled: boolean) => {
	const userInfo = useUserInfo();
	const { data: sanctions } = useMySanctions(enabled ? userInfo?.uid : undefined);
	const warningId = sanctions ? findUnacknowledgedWarning(sanctions)?.id : undefined;

	useEffect(() => {
		if (!enabled || !warningId) return;

		// 조치 목록이 내비게이터 준비보다 먼저 오면, 준비된 뒤 첫 화면 상태 변화 때 띄운다
		const showWarning = () => {
			if (!navigationRef.isReady()) return false;
			if (navigationRef.getCurrentRoute()?.name !== 'SanctionWarning') {
				navigate('SanctionWarning', { sanctionId: warningId });
			}
			return true;
		};

		if (showWarning()) return;
		const unsubscribe = navigationRef.addListener('state', () => {
			if (showWarning()) unsubscribe();
		});
		return unsubscribe;
	}, [enabled, warningId]);
};

import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { AppStateStatus } from 'react-native';
import { AppState, Platform } from 'react-native';

// 앱 포커스 시 새로고침
// 창에 있는 이벤트 리스너 대신 React Native는 AppState 모듈을 통해 포커스 정보를 제공합니다.
// 앱 상태가 "활성"으로 변경될 때 AppState "change" 이벤트를 사용하여 업데이트를 트리거할 수 있습니다:
export function useOnlineManager() {
	useEffect(() => {
		const subscription = AppState.addEventListener(
			'change',
			(status: AppStateStatus) => {
				if (Platform.OS !== 'web') {
					focusManager.setFocused(status === 'active');
				}
			},
		);

		return () => subscription.remove();
	}, []);
}

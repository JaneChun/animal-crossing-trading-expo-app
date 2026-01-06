import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';

/**
	 * 화면 포커스 시 쿼리 자동 새로고침
	 * - 첫 마운트 시에는 실행되지 않음
	 * - 탭 전환, 네비게이션 복귀 시 실행
	 * @param refetch - React Query refetch 함수
*/
export const useRefreshOnFocus = <T>(refetch: () => Promise<T>) => {
	const firstTimeRef = React.useRef(true);

	useFocusEffect(
		useCallback(() => {
			if (firstTimeRef.current) {
				firstTimeRef.current = false;
				return;
			}

			refetch();
		}, [refetch]),
	);
};

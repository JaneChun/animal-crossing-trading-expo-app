import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';

// 화면 포커스 시 새로고침
// 어떤 상황에서는 React Native 화면이 다시 포커싱될 때 쿼리를 새로고침하고 싶을 수 있습니다.
// 이 커스텀 훅은 화면이 다시 포커싱될 때 제공된 리프레시 함수를 호출합니다.
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

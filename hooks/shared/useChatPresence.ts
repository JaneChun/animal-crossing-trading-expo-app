import { setActiveChatRoom } from '@/firebase/services/userService';
import { useAuthStore } from '@/stores/AuthStore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// 유저가 채팅방에 들어올 때 / 나갈 때 활성화 채팅방 기록
export const useChatPresence = (chatId: string) => {
	const appState = useRef(AppState.currentState);
	const userInfo = useAuthStore((state) => state.userInfo);

	useFocusEffect(
		useCallback(() => {
			if (!userInfo) return;

			setActiveChatRoom({ userId: userInfo.uid, chatId });

			return () => {
				setActiveChatRoom({ userId: userInfo.uid, chatId: '' });
			};
		}, [chatId, userInfo?.uid]),
	);

	useEffect(() => {
		if (!userInfo) return;

		const subscription = AppState.addEventListener('change', (nextState) => {
			const prev = appState.current;

			// 백그라운드 → 액티브 복귀 시 다시 기록
			if (prev.match(/background|inactive/) && nextState === 'active') {
				setActiveChatRoom({ userId: userInfo.uid, chatId });
			}

			// 액티브 → 비활성 상태 전환 시 초기화
			if (prev === 'active' && nextState.match(/background|inactive/)) {
				setActiveChatRoom({ userId: userInfo.uid, chatId: '' });
			}

			appState.current = nextState;
		});

		return () => {
			subscription.remove();
		};
	}, [userInfo?.uid, chatId]);
};

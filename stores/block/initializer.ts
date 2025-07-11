import { db } from '@/fbase';
import { useAuthStore } from '@/stores/AuthStore';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import { useBlockStore } from './store';

export const useBlockSubscriptionInitializer = () => {
	const { userInfo } = useAuthStore();
	const { setBlockedUsers, setBlockedBy, setIsLoading, clearBlocks } =
		useBlockStore();

	useEffect(() => {
		// 로그아웃 상태면 초기화
		if (!userInfo) {
			clearBlocks();
			return;
		}

		setIsLoading(true);

		// "내가 차단한 유저 리스트" 구독
		const unsubscribeBlockedUsers = onSnapshot(
			collection(db, 'Users', userInfo.uid, 'BlockedUsers'),
			(snap) => {
				const ids = snap.docs.map((d) => d.id);
				setBlockedUsers(ids);
				setIsLoading(false);
			},
			(e) => {
				console.warn('⚠️ BlockStore BlockedUsers 구독 에러', e);
				setIsLoading(false);
			},
		);

		// "나를 차단한 유저 리스트" 구독
		const unsubscribeBlockedBy = onSnapshot(
			collection(db, 'Users', userInfo.uid, 'BlockedBy'),
			(snap) => {
				const ids = snap.docs.map((d) => d.id);
				setBlockedBy(ids);
				setIsLoading(false);
			},
			(e) => {
				console.warn('⚠️ BlockStore BlockedBy 구독 에러', e);
				setIsLoading(false);
			},
		);

		return () => {
			unsubscribeBlockedUsers();
			unsubscribeBlockedBy();
		};
	}, [userInfo, setBlockedUsers, setBlockedBy, setIsLoading, clearBlocks]);
};

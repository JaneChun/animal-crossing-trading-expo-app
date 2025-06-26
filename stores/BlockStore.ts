import { db } from '@/fbase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import { create } from 'zustand';
import { useAuthStore } from './AuthStore';

type BlockStoreState = {
	blockedUsers: string[];
	setBlockedUsers: (ids: string[]) => void;
	blockedBy: string[];
	setBlockedBy: (ids: string[]) => void;
	isLoading: boolean;
	setIsLoading: (b: boolean) => void;
};

export const useBlockStore = create<BlockStoreState>((set) => ({
	blockedUsers: [],
	blockedBy: [],
	isLoading: false,
	setBlockedUsers: (ids: string[]) => set({ blockedUsers: ids }),
	setBlockedBy: (ids: string[]) => set({ blockedBy: ids }),
	setIsLoading: (b: boolean) => set({ isLoading: b }),
}));

export const useBlockSubscriptionInitializer = () => {
	const { userInfo } = useAuthStore();
	const setBlockedUsers = useBlockStore((s) => s.setBlockedUsers);
	const setBlockedBy = useBlockStore((s) => s.setBlockedBy);
	const setIsLoading = useBlockStore((s) => s.setIsLoading);

	useEffect(() => {
		// 로그아웃 상태면 초기화
		if (!userInfo) {
			setBlockedUsers([]);
			setBlockedBy([]);
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
	}, [userInfo?.uid]);
};

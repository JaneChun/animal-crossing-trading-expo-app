import BlockedUserUnit from '@/components/Block/BlockedUserUnit';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import { PADDING } from '@/components/ui/layout/Layout';
import { Colors } from '@/constants/Color';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { useBlockStore } from '@/stores/block';
import { BlockedUser } from '@/types/user';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Block = () => {
	const blockedUsers = useBlockStore((state) => state.blockedUsers);
	const [usersList, setUsersList] = useState<BlockedUser[]>([]);
	const usersListRef = useRef(usersList);

	// 항상 최신 usersList 를 ref 에 동기화
	useEffect(() => {
		usersListRef.current = usersList;
	}, [usersList]);

	useEffect(() => {
		let canceled = false;

		const syncUsersList = async () => {
			// 이전 리스트 복사 → Map 생성
			const prev = usersListRef.current;
			const map = new Map(prev.map((u) => [u.uid, { ...u }]));

			// 새로 차단된 유저 정보 fetch & 추가
			for (const uid of blockedUsers) {
				if (map.has(uid)) {
					map.get(uid)!.isBlocked = true;
				} else {
					const info = await getPublicUserInfo(uid);
					map.set(uid, { ...info, isBlocked: true });
				}
			}

			// 해제된 유저는 isBlocked = false
			for (const [uid, user] of map.entries()) {
				if (!blockedUsers.includes(uid)) {
					user.isBlocked = false;
				}
			}

			if (!canceled) {
				setUsersList(Array.from(map.values()));
			}
		};

		syncUsersList();

		return () => {
			canceled = true;
		};
	}, [blockedUsers]);

	const renderItem = ({ item }: { item: BlockedUser }) => (
		<BlockedUserUnit
			key={item.uid}
			blockedUserInfo={item}
			onToggleBlock={(uid, newState) => {
				setUsersList((prev) =>
					prev.map((u) => (u.uid === uid ? { ...u, isBlocked: newState } : u)),
				);
			}}
		/>
	);

	return (
		<FlatList
			data={usersList}
			keyExtractor={(u) => u.uid}
			renderItem={renderItem}
			ItemSeparatorComponent={() => <View style={styles.separator} />}
			ListEmptyComponent={
				<EmptyIndicator message='차단한 사용자가 없습니다.' />
			}
			style={styles.screen}
			contentContainerStyle={styles.content}
		/>
	);
};

export default Block;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	content: {
		flexGrow: 1,
		paddingVertical: PADDING,
	},
	separator: {
		height: 1,
		backgroundColor: Colors.border_gray,
		marginHorizontal: 16,
	},
});

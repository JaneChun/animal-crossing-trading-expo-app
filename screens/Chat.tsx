import ChatUnit from '@/components/Chat/ChatUnit';
import Layout from '@/components/ui/Layout';
import { Colors } from '@/constants/Color';
import useGetChats from '@/hooks/useGetChats';
import useLoading from '@/hooks/useLoading';
import { useAuthStore } from '@/stores/AuthStore';
import { ChatWithReceiverInfo } from '@/types/chat';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const Chat = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const { chats, isLoading } = useGetChats();
	const { LoadingIndicator } = useLoading();

	const renderChatItem = ({ item }: { item: ChatWithReceiverInfo }) => {
		return <ChatUnit {...item} />;
	};

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<Layout title='채팅'>
			{!userInfo || chats.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>참여 중인 채팅방이 없습니다.</Text>
				</View>
			) : (
				<FlatList
					data={chats}
					keyExtractor={({ id }) => id}
					renderItem={renderChatItem}
				/>
			)}
		</Layout>
	);
};

const styles = StyleSheet.create({
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 14,
		color: Colors.font_gray,
	},
});

export default Chat;

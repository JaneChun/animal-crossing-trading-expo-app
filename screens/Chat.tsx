import ChatUnit from '@/components/Chat/ChatUnit';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import Layout from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { useAuthStore } from '@/stores/AuthStore';
import { useChatStore } from '@/stores/ChatStore';
import { ChatWithReceiverInfo } from '@/types/chat';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';

const Chat = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const chats = useChatStore((state) => state.chats);
	const isLoading = useChatStore((state) => state.isLoading);

	const renderChatItem = ({ item }: { item: ChatWithReceiverInfo }) => {
		return <ChatUnit {...item} />;
	};

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<SafeAreaView style={styles.screen}>
			<Layout title='채팅'>
				{!userInfo || chats.length === 0 ? (
					<EmptyIndicator
						iconType='MaterialCommunityIcons'
						iconName='message-processing-outline'
						message='참여 중인 채팅방이 없습니다.'
					/>
				) : (
					<FlatList
						data={chats}
						keyExtractor={({ id }) => id}
						renderItem={renderChatItem}
					/>
				)}
			</Layout>
		</SafeAreaView>
	);
};

export default Chat;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
});

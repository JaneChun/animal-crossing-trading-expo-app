import ChatInput from '@/components/Chat/ChatInput';
import DateSeparator from '@/components/Chat/DateSeparator';
import UserInfoLabel from '@/components/Chat/Message/UserInfoLabel';
import MessageUnit from '@/components/Chat/MessageUnit';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import KeyboardStickyLayout from '@/components/ui/layout/KeyboardStickyLayout';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { useGetChatMessages } from '@/hooks/firebase/useGetChatMessages';
import { useLeaveChatRoom } from '@/hooks/mutation/chat/useLeaveChatRoom';
import { useMarkMessagesAsRead } from '@/hooks/mutation/chat/useMarkMessagesAsRead';
import { useReceiverInfo } from '@/hooks/query/chat/useReceiverInfo';
import { useChatPresence } from '@/hooks/shared/useChatPresence';
import { goBack } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { MessageType } from '@/types/chat';
import { ChatRoomRouteProp } from '@/types/navigation';
import { isSystemMessage } from '@/utilities/typeGuards/messageGuards';
import { useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const ChatRoom = () => {
	const route = useRoute<ChatRoomRouteProp>();
	const { chatId } = route.params;
	useChatPresence(chatId);
	const userInfo = useAuthStore((state) => state.userInfo);

	const { messages, isLoading: isMessagesFetching } =
		useGetChatMessages(chatId);
	const { data: receiverInfo, isLoading: isReceiverInfoFetching } =
		useReceiverInfo(chatId);

	const { mutate: leaveChatRoom } = useLeaveChatRoom({ chatId });
	const { mutate: markMessagesAsRead } = useMarkMessagesAsRead();

	// 유저가 채팅방에 들어올 때, 입장한 이후에도 새 메시지가 올 때 markMessagesAsRead 실행
	useEffect(() => {
		const readMessages = async () => {
			if (chatId && userInfo) {
				markMessagesAsRead({ chatId, userId: userInfo.uid });
			}
		};

		readMessages();
	}, [chatId, userInfo, messages]);

	const scrollToBottom = () => {
		console.log('ChatRoom scrollToBottom');
	};

	const renderMessage = useCallback(
		({ item }: { item: MessageType }) => {
			if (isSystemMessage(item)) {
				return <DateSeparator date={item.date} />;
			}

			return <MessageUnit message={item} receiverId={receiverInfo!.uid} />;
		},
		[receiverInfo?.uid],
	);

	const leaveChat = async () => {
		if (!userInfo) return;

		leaveChatRoom({ userId: userInfo.uid });
		goBack();
	};

	return (
		<SafeAreaView style={styles.screen}>
			<LayoutWithHeader
				headerCenterComponent={
					receiverInfo && <UserInfoLabel userInfo={receiverInfo} />
				}
				headerRightComponent={
					<ActionSheetButton
						color={Colors.font_black}
						size={18}
						options={[
							{ label: '나가기', onPress: leaveChat },
							{ label: '취소', onPress: () => {} },
						]}
					/>
				}
			>
				{isMessagesFetching || isReceiverInfoFetching ? (
					<LoadingIndicator />
				) : !chatId || !receiverInfo ? (
					<EmptyIndicator message='채팅방을 찾을 수 없습니다.' />
				) : (
					<KeyboardStickyLayout
						scrollableContent={
							<FlatList
								data={messages}
								keyExtractor={({ id }) => id}
								renderItem={renderMessage}
								style={styles.flatList}
								contentContainerStyle={styles.flatListContent}
								inverted={true}
							/>
						}
						bottomContent={
							userInfo?.uid &&
							receiverInfo?.uid && (
								<ChatInput
									chatId={chatId}
									senderUid={userInfo.uid}
									receiverUid={receiverInfo.uid}
									scrollToBottom={scrollToBottom}
									disabled={
										receiverInfo?.displayName === DEFAULT_USER_DISPLAY_NAME
									}
								/>
							)
						}
					/>
				)}
			</LayoutWithHeader>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	flatList: {
		backgroundColor: Colors.base,
	},
	flatListContent: {
		padding: 24,
	},
	invalidPostContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	invalidPostText: {
		color: Colors.font_gray,
		alignSelf: 'center',
	},
});

export default ChatRoom;

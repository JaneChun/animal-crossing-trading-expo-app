import DateSeparator from '@/components/Chat/DateSeparator';
import UserInfoLabel from '@/components/Chat/Message/UserInfoLabel';
import MessageUnit from '@/components/Chat/MessageUnit';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import Input from '@/components/ui/inputs/Input';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { useGetChatMessages } from '@/hooks/firebase/useGetChatMessages';
import { useLeaveChatRoom } from '@/hooks/mutation/chat/useLeaveChatRoom';
import { useMarkMessagesAsRead } from '@/hooks/mutation/chat/useMarkMessagesAsRead';
import { useSendMessage } from '@/hooks/mutation/chat/useSendMessage';
import { useReceiverInfo } from '@/hooks/query/chat/useReceiverInfo';
import { goBack } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { MessageType } from '@/types/chat';
import { ChatRoomRouteProp } from '@/types/navigation';
import { isSystemMessage } from '@/utilities/typeGuards/messageGuards';
import { useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const ChatRoom = () => {
	const route = useRoute<ChatRoomRouteProp>();
	const { chatId } = route.params;
	const userInfo = useAuthStore((state) => state.userInfo);
	const [chatInput, setChatInput] = useState('');
	const flatListRef = useRef<FlatList>(null);

	const { messages, isLoading: isMessagesFetching } =
		useGetChatMessages(chatId);
	const { data: receiverInfo, isLoading: isReceiverInfoFetching } =
		useReceiverInfo(chatId);

	const { mutate: leaveChatRoom } = useLeaveChatRoom({ chatId });
	const { mutate: markMessagesAsRead } = useMarkMessagesAsRead();
	const { mutate: sendMessage } = useSendMessage();

	// 유저가 채팅방에 들어올 때, 입장한 이후에도 새 메시지가 올 때 markMessagesAsRead 실행
	useEffect(() => {
		const readMessages = async () => {
			if (chatId && userInfo) {
				markMessagesAsRead({ chatId, userId: userInfo.uid });
			}
		};

		readMessages();
	}, [chatId, userInfo, messages]);

	const onSubmit = async () => {
		if (!userInfo || !receiverInfo || chatInput === '') return;

		sendMessage({
			chatId,
			senderId: userInfo.uid,
			receiverId: receiverInfo.uid,
			message: chatInput.trim(),
		});

		setChatInput('');
		scrollToBottom();
	};

	const scrollToBottom = () => {
		flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
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
				<KeyboardAvoidingView style={styles.screen} behavior='padding'>
					{/* 메세지 목록 */}
					<FlatList
						ref={flatListRef}
						data={messages}
						keyExtractor={({ id }) => id}
						renderItem={renderMessage}
						contentContainerStyle={styles.flatListContainer}
						inverted={true}
					/>

					{/* 인풋 */}
					{receiverInfo?.displayName !== DEFAULT_USER_DISPLAY_NAME && (
						<Input
							input={chatInput}
							setInput={setChatInput}
							placeholder='메세지 보내기'
							onPress={onSubmit}
						/>
					)}
				</KeyboardAvoidingView>
			)}
		</LayoutWithHeader>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.base,
	},
	flatListContainer: {
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

import {
	renderComposer,
	renderDay,
	renderMessage,
} from '@/components/Chat/CustomRenderers';
import UserInfoLabel from '@/components/Chat/Message/UserInfoLabel';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { createChatRoom } from '@/firebase/services/chatService';

import { useChatPresence } from '@/hooks/shared/useChatPresence';
import { useChatRoom } from '@/hooks/shared/useChatRoom';
import { useKeyboardHeight } from '@/hooks/shared/useKeyboardHeight';

import { goBack } from '@/navigation/RootNavigation';
import { Message } from '@/types/chat';
import { ChatRoomRouteProp } from '@/types/navigation';
import { convertSendParamsToMessage } from '@/utilities/convertSendParamsToMessage';
import { createIMessage } from '@/utilities/createIMessage';

import { useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';

const ChatRoom = () => {
	const hasChatRoomCreated = useRef<boolean>(false);
	const hasSystemMessageSent = useRef<boolean>(false);

	const route = useRoute<ChatRoomRouteProp>();
	const { chatId, chatStartInfo, systemMessage } = route.params;

	const [localMessages, setLocalMessages] = useState<Message[]>([]);

	// 최초 진입 시 systemMessage가 전달되었다면 UI에만 표시 (DB에는 아직 저장되지 않음)
	useEffect(() => {
		if (systemMessage) {
			const message = convertSendParamsToMessage({
				sendParams: systemMessage,
				chatId,
			});

			setLocalMessages([message]); // localMessages에 저장
		}
	}, [chatId, systemMessage]);

	const {
		userInfo,
		receiverInfo,
		isLoading,
		messages,
		sendMessage,
		leaveChatRoom,
	} = useChatRoom({
		chatId,
		localMessages,
	});

	useChatPresence(chatId);

	const insets = useSafeAreaInsets();
	const keyboardHeight = useKeyboardHeight();
	const giftedChatRef = useRef<any>(null);

	// 새 메세지 올 때 아래로 스크롤
	useEffect(() => {
		if (giftedChatRef.current) {
			giftedChatRef.current.scrollToOffset?.({ offset: 0, animated: true });
		}
	}, [messages]);

	const handleSend = async (chatInput: string) => {
		if (!userInfo?.uid || !receiverInfo?.uid || !chatInput.trim()) return;

		// 채팅방 생성
		if (chatStartInfo && !hasChatRoomCreated.current) {
			const createdChatId = await createChatRoom(chatStartInfo);
			if (!createdChatId) return;

			hasChatRoomCreated.current = true;
		}

		// 시스템 메세지 전송
		if (systemMessage && !hasSystemMessageSent.current) {
			sendMessage(systemMessage); // systemMessage를 DB에 저장 후
			setLocalMessages([]); // localMessages 초기화

			hasSystemMessageSent.current = true;
		}

		// 유저 메세지 전송
		const newMessage: IMessage = createIMessage(userInfo.uid, chatInput);

		sendMessage({
			chatId,
			senderId: userInfo.uid,
			receiverId: receiverInfo.uid,
			message: newMessage.text,
		});
	};

	const handleLeave = async () => {
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
							{ label: '나가기', onPress: handleLeave },
							{ label: '취소', onPress: () => {} },
						]}
					/>
				}
			>
				{isLoading ? (
					<LoadingIndicator />
				) : !chatId || !receiverInfo ? (
					<EmptyIndicator message='채팅방을 찾을 수 없습니다.' />
				) : (
					<KeyboardAvoidingView style={{ flex: 1 }}>
						<GiftedChat
							messageContainerRef={giftedChatRef}
							messages={messages}
							user={{ _id: userInfo!.uid }}
							messagesContainerStyle={{
								backgroundColor: Colors.base,
								paddingTop: keyboardHeight, // 키보드 올라왔을 때 키보드 높이만큼 잘리는 컨텐츠 방지
							}}
							bottomOffset={-insets.bottom} // 키보드 올라왔을 때 아래로 insets.bottom만큼 이동
							renderMessage={renderMessage}
							renderDay={renderDay}
							renderComposer={() =>
								renderComposer({
									disabled:
										receiverInfo?.displayName === DEFAULT_USER_DISPLAY_NAME,
									onSend: handleSend,
								})
							}
						/>
					</KeyboardAvoidingView>
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

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

import { useChatPresence } from '@/hooks/shared/useChatPresence';
import { useChatRoom } from '@/hooks/shared/useChatRoom';
import { useKeyboardHeight } from '@/hooks/shared/useKeyboardHeight';

import { goBack } from '@/navigation/RootNavigation';
import { ChatRoomRouteProp } from '@/types/navigation';
import { createIMessage } from '@/utilities/createIMessage';

import { useRoute } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';

const ChatRoom = () => {
	const route = useRoute<ChatRoomRouteProp>();
	const { chatId, systemMessage } = route.params;

	const {
		userInfo,
		receiverInfo,
		isLoading,
		messages,
		sendMessage,
		leaveChatRoom,
		addLocalSystemMessage,
		removeLocalSystemMessage,
	} = useChatRoom(chatId);

	const insets = useSafeAreaInsets();
	const keyboardHeight = useKeyboardHeight();
	const giftedChatRef = useRef<any>(null);

	useChatPresence(chatId);

	// 채팅방 입장 시, 시스템 메세지를 params로 받았다면
	useEffect(() => {
		if (systemMessage) {
			addLocalSystemMessage(systemMessage); // UI에만 추가
		}
	}, []);

	// 새 메세지 올 때 아래로 스크롤
	useEffect(() => {
		if (giftedChatRef.current) {
			giftedChatRef.current.scrollToOffset?.({ offset: 0, animated: true });
		}
	}, [messages]);

	const handleSend = async (chatInput: string) => {
		if (!userInfo?.uid || !receiverInfo?.uid || !chatInput.trim()) return;

		const newMessage: IMessage = createIMessage(userInfo.uid, chatInput);

		// 시스템 메세지가 있다면 전송
		if (systemMessage) {
			sendMessage(systemMessage); // DB에 추가 후
			removeLocalSystemMessage(); // UI에서 삭제
		}

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

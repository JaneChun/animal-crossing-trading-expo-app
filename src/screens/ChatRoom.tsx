import { renderComposer, renderDay, renderMessage } from '@/components/Chat/CustomRenderers';
import ImageConfirmModal from '@/components/Chat/ImageConfirmModal';
import UserInfoLabel from '@/components/Chat/Message/UserInfoLabel';
import ReportModal from '@/components/PostDetail/ReportModal';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';

import { useChatRoom } from '@/hooks/chat/useChatRoom';
import { useCreateChatRoom } from '@/hooks/chat/mutation/useCreateChatRoom';
import { useSendImageMessage } from '@/hooks/chat/mutation/useSendImageMessage';
import { useBlockUser } from '@/hooks/shared/useBlockUser';
import { useChatPresence } from '@/hooks/shared/useChatPresence';
import { useImagePicker } from '@/hooks/shared/useImagePicker';
import { useKeyboardHeight } from '@/hooks/shared/useKeyboardHeight';
import { useReportUser } from '@/hooks/shared/useReportUser';

import { goBack } from '@/navigation/RootNavigation';
import { useBlockStore } from '@/stores/block';
import { Message } from '@/types/chat';
import { ChatRoomRouteProp } from '@/types/navigation';
import { convertSendParamsToMessage } from '@/utilities/convertSendParamsToMessage';
import { createIMessage } from '@/utilities/createIMessage';
import { ImagePickerAsset } from 'expo-image-picker';

import { useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatRoom = () => {
	const hasChatRoomCreated = useRef<boolean>(false);
	const hasSystemMessageSent = useRef<boolean>(false);

	const route = useRoute<ChatRoomRouteProp>();
	const { chatId, chatStartInfo, receiverInfo: passedReceiverInfo, systemMessage } = route.params;

	// 메세지
	const [localMessages, setLocalMessages] = useState<Message[]>([]);
	// 이미지 전송 전 미리보기
	const [confirmImage, setConfirmImage] = useState<ImagePickerAsset | null>(null);

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
		receiverInfo: fetchedReceiverInfo,
		isLoading,
		messages,
		sendMessage,
		leaveChatRoom,
		canLoadMore,
		isLoadingMore,
		onLoadMore,
	} = useChatRoom({
		chatId,
		localMessages,
	});

	// 전달받은 receiverInfo를 우선 사용하고, 없으면 fetch된 정보 사용
	const receiverInfo = passedReceiverInfo || fetchedReceiverInfo;

	// 채팅방 생성
	const { mutateAsync: createChatRoomAsync } = useCreateChatRoom();

	// 이미지 전송
	const { pickImage } = useImagePicker({ multiple: false });
	const { mutate: sendImageMessage } = useSendImageMessage();

	useChatPresence(chatId);

	// 신고
	const { isReportModalVisible, openReportModal, closeReportModal, submitReport } =
		useReportUser();

	// 차단
	const { isBlockedByMe, toggleBlock: onToggleBlock } = useBlockUser({
		targetUserId: receiverInfo?.uid,
		targetUserDisplayName: receiverInfo?.displayName,
	});
	const blockedBy = useBlockStore((state) => state.blockedBy);
	const amIBlockedBy = blockedBy.some((uid) => uid === receiverInfo?.uid);

	const blockMessage = isBlockedByMe
		? '내가 차단한 사용자입니다.'
		: amIBlockedBy
			? '상대방이 나를 차단하여 메시지를 보낼 수 없습니다.'
			: '';

	const insets = useSafeAreaInsets();
	const keyboardHeight = useKeyboardHeight();
	const giftedChatRef = useRef<any>(null);

	// 새 메시지가 도착했을 때만 맨 아래로 스크롤 (과거 메시지 로드 시에는 스크롤 위치 유지)
	// messages는 desc 순서(최신이 [0])이므로, 최신 메시지 ID가 바뀔 때만 실행
	const latestMessageId = messages[0]?._id;
	useEffect(() => {
		if (giftedChatRef.current) {
			giftedChatRef.current.scrollToOffset?.({ offset: 0, animated: true });
		}
	}, [latestMessageId]);

	const handleSend = async (chatInput: string, image?: ImagePickerAsset) => {
		if (!userInfo?.uid || !receiverInfo?.uid || isBlockedByMe || amIBlockedBy) return;
		if (!chatInput.trim() && !image) return;

		// 채팅방 생성
		if (chatStartInfo && !hasChatRoomCreated.current) {
			const createdChatId = await createChatRoomAsync(chatStartInfo);
			if (!createdChatId) return;

			hasChatRoomCreated.current = true;
		}

		// 시스템 메세지 전송
		if (systemMessage && !hasSystemMessageSent.current) {
			sendMessage(systemMessage);
			setLocalMessages([]);

			hasSystemMessageSent.current = true;
		}

		// 이미지 메세지 전송
		if (image) {
			sendImageMessage({
				chatId,
				senderId: userInfo.uid,
				receiverId: receiverInfo.uid,
				image,
			});
			return;
		}

		// 텍스트 메세지 전송
		const newMessage: IMessage = createIMessage({ senderId: userInfo.uid, text: chatInput });

		sendMessage({
			chatId,
			senderId: userInfo.uid,
			receiverId: receiverInfo.uid,
			message: newMessage.text,
		});
	};

	const handleImagePress = async () => {
		if (!userInfo?.uid || !receiverInfo?.uid || isBlockedByMe || amIBlockedBy) return;

		const images = await pickImage(1);
		if (!images || images.length === 0) return;

		setConfirmImage(images[0]);
	};

	const handleImageSendConfirm = async () => {
		if (!confirmImage) return;

		await handleSend('', confirmImage);
		setConfirmImage(null);
	};

	const handleLeave = async () => {
		if (!userInfo) return;

		leaveChatRoom({ userId: userInfo.uid });
		goBack();
	};

	const headerOptions = [
		{
			label: isBlockedByMe ? '차단 해제' : '차단',
			onPress: onToggleBlock,
		},
		{
			label: '신고',
			onPress: () =>
				openReportModal({
					chatId,
					reporteeId: receiverInfo!.uid,
				}),
		},
		{ label: '나가기', onPress: handleLeave },
		{ label: '취소', onPress: () => {} },
	];

	return (
		<>
			<SafeAreaView style={styles.screen} edges={['bottom']}>
				<LayoutWithHeader
					headerCenterComponent={
						receiverInfo && <UserInfoLabel userInfo={receiverInfo} />
					}
					headerRightComponent={
						<ActionSheetButton
							color={Colors.font_black}
							size={18}
							destructiveButtonIndex={2}
							options={headerOptions}
						/>
					}
				>
					{isLoading ? (
						<LoadingIndicator />
					) : !chatId || !receiverInfo ? (
						<EmptyIndicator message="채팅방을 찾을 수 없습니다." />
					) : (
						<KeyboardAvoidingView style={{ flex: 1 }}>
							{blockMessage && (
								<View style={styles.blockMessageContainer}>
									<Text style={styles.blockMessageText}>{blockMessage}</Text>
								</View>
							)}
							<GiftedChat
								messageContainerRef={giftedChatRef}
								messages={messages}
								user={{ _id: userInfo!.uid }}
								messagesContainerStyle={{
									backgroundColor: Colors.base,
									paddingTop: keyboardHeight, // 키보드 올라왔을 때 키보드 높이만큼 잘리는 컨텐츠 방지
								}}
								bottomOffset={-insets.bottom} // 키보드 올라왔을 때 아래로 insets.bottom만큼 이동
								infiniteScroll
								loadEarlier={canLoadMore}
								onLoadEarlier={onLoadMore}
								isLoadingEarlier={isLoadingMore}
								renderLoadEarlier={() => null}
								renderMessage={renderMessage}
								renderDay={renderDay}
								renderComposer={() =>
									renderComposer({
										disabled:
											receiverInfo?.displayName ===
												DEFAULT_USER_DISPLAY_NAME ||
											isBlockedByMe ||
											amIBlockedBy,
										onSend: handleSend,
										onImagePress: handleImagePress,
									})
								}
							/>
						</KeyboardAvoidingView>
					)}
				</LayoutWithHeader>
			</SafeAreaView>

			<ImageConfirmModal
				visible={!!confirmImage}
				image={confirmImage}
				onSend={handleImageSendConfirm}
				onClose={() => setConfirmImage(null)}
			/>

			{isReportModalVisible && (
				<ReportModal
					isVisible={isReportModalVisible}
					onClose={closeReportModal}
					onSubmit={submitReport}
				/>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	blockMessageContainer: {
		paddingVertical: 16,
		backgroundColor: Colors.badge_red,
	},
	blockMessageText: {
		textAlign: 'center',
		color: 'white',
	},
});
export default ChatRoom;

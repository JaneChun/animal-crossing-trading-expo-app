import {
	renderComposer,
	renderDay,
	renderMessage,
} from '@/components/Chat/CustomRenderers';
import UserInfoLabel from '@/components/Chat/Message/UserInfoLabel';
import ReportModal from '@/components/PostDetail/ReportModal';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { blockUser, unblockUser } from '@/firebase/services/blockService';
import { createChatRoom } from '@/firebase/services/chatService';
import { createReport } from '@/firebase/services/reportService';

import { useChatRoom } from '@/hooks/chat/useChatRoom';
import { useChatPresence } from '@/hooks/shared/useChatPresence';
import { useKeyboardHeight } from '@/hooks/shared/useKeyboardHeight';

import { goBack } from '@/navigation/RootNavigation';
import { useBlockStore } from '@/stores/BlockStore';
import { Message } from '@/types/chat';
import { ChatRoomRouteProp } from '@/types/navigation';
import { CreateReportRequest, ReportCategory } from '@/types/report';
import { PublicUserInfo } from '@/types/user';
import { convertSendParamsToMessage } from '@/utilities/convertSendParamsToMessage';
import { createIMessage } from '@/utilities/createIMessage';

import { useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
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
	const [isReportModalVisible, setIsReportModalVisible] =
		useState<boolean>(false);

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

	const blockedUsers = useBlockStore((state) => state.blockedUsers);
	const blockedBy = useBlockStore((state) => state.blockedBy);
	const isBlockedByMe = blockedUsers.some((uid) => uid === receiverInfo?.uid);
	const amIBlockedBy = blockedBy.some((uid) => uid === receiverInfo?.uid);

	const blockMessage = isBlockedByMe
		? '내가 차단한 사용자입니다.'
		: amIBlockedBy
		? '상대방이 나를 차단하여 메시지를 보낼 수 없습니다.'
		: '';

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
		if (
			!userInfo?.uid ||
			!receiverInfo?.uid ||
			!chatInput.trim() ||
			isBlockedByMe ||
			amIBlockedBy
		)
			return;

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

	const handleBlockUser = async (
		targetUserInfo: PublicUserInfo | null | undefined,
	) => {
		if (!targetUserInfo || !userInfo) return;

		Alert.alert(
			'상대방을 차단할까요?',
			`차단하면 ${targetUserInfo.displayName}님과 더 이상 메세지를 주고 받을 수 없어요.`,
			[
				{ text: '취소', style: 'cancel' },
				{
					text: '네, 차단할게요',
					onPress: async () => {
						await blockUser({
							userId: userInfo.uid,
							targetUserId: targetUserInfo.uid,
						});

						showToast(
							'success',
							`${targetUserInfo.displayName}님을 차단했어요.`,
						);
					},
				},
			],
		);
	};

	const handleUnblockUser = async (
		targetUserInfo: PublicUserInfo | null | undefined,
	) => {
		if (!targetUserInfo || !userInfo) return;

		await unblockUser({
			userId: userInfo.uid,
			targetUserId: targetUserInfo.uid,
		});

		showToast('success', `${targetUserInfo.displayName}님을 차단 해제했어요.`);
	};

	const reportUser = async ({
		category,
		detail = '',
	}: {
		category: ReportCategory;
		detail?: string;
	}) => {
		try {
			if (!receiverInfo?.uid || !userInfo) return;

			if (receiverInfo.uid === userInfo.uid) return;

			const postReport: CreateReportRequest = {
				reporterId: userInfo.uid,
				reporteeId: receiverInfo.uid,
				chatId,
				category,
				detail,
			};

			await createReport(postReport);

			showToast('success', '신고가 제출되었습니다.');
		} catch (e) {
			showToast('error', '신고 제출 중 오류가 발생했습니다.');
		} finally {
			setIsReportModalVisible(false);
		}
	};

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
							options={[
								{
									label: isBlockedByMe ? '차단 해제' : '차단',
									onPress: () =>
										isBlockedByMe
											? handleUnblockUser(receiverInfo)
											: handleBlockUser(receiverInfo),
								},
								{
									label: '신고',
									onPress: () => setIsReportModalVisible(true),
								},
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
								renderMessage={renderMessage}
								renderDay={renderDay}
								renderComposer={() =>
									renderComposer({
										disabled:
											receiverInfo?.displayName === DEFAULT_USER_DISPLAY_NAME ||
											isBlockedByMe ||
											amIBlockedBy,
										onSend: handleSend,
									})
								}
							/>
						</KeyboardAvoidingView>
					)}
				</LayoutWithHeader>
			</SafeAreaView>

			{isReportModalVisible && (
				<ReportModal
					isVisible={isReportModalVisible}
					onClose={() => setIsReportModalVisible(false)}
					onSubmit={({ category, detail }) => reportUser({ category, detail })}
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

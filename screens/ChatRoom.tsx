import Message from '@/components/Chat/Message';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import Input from '@/components/ui/Input';
import { Colors } from '@/constants/Color';
import { useGetChatMessages } from '@/hooks/firebase/useGetChatMessages';
import { useLeaveChatRoom } from '@/hooks/mutation/chat/useLeaveChatRoom';
import { useMarkMessagesAsRead } from '@/hooks/mutation/chat/useMarkMessagesAsRead';
import { useSendMessage } from '@/hooks/mutation/chat/useSendMessage';
import { useReceiverInfo } from '@/hooks/query/chat/useReceiverInfo';
import useLoading from '@/hooks/shared/useLoading';
import { useAuthStore } from '@/stores/AuthStore';
import { ChatRoomRouteProp, ChatStackNavigation } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
	Image,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const ChatRoom = () => {
	const route = useRoute<ChatRoomRouteProp>();
	const { chatId } = route.params;
	const stackNavigation = useNavigation<ChatStackNavigation>();
	const { LoadingIndicator } = useLoading();
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

	const leaveChat = async () => {
		if (!userInfo) return;

		leaveChatRoom({ userId: userInfo.uid });
		stackNavigation.goBack();
	};

	const renderMessage = ({ item }: { item: any }) => {
		if (item.isDateSeparator) {
			return (
				<View style={styles.dateSeparator}>
					<Text style={styles.dateSeparatorText}>{item.date}</Text>
				</View>
			);
		}

		return <Message message={item} receiverId={receiverInfo!.uid} />;
	};

	if (isMessagesFetching || isReceiverInfoFetching) {
		console.log(isMessagesFetching, isReceiverInfoFetching);
		return <LoadingIndicator />;
	}

	if (!chatId || !receiverInfo) {
		return (
			<View style={styles.screen}>
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.iconContainer}
						onPress={() =>
							stackNavigation.reset({
								index: 0,
								routes: [{ name: 'Chat' }],
							})
						}
					>
						<Ionicons
							name='chevron-back-outline'
							size={24}
							color={Colors.font_black}
						/>
					</TouchableOpacity>
				</View>
				<View style={styles.invalidPostContainer}>
					<Text style={styles.invalidPostText}>채팅방을 찾을 수 없습니다.</Text>
				</View>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView style={styles.screen} behavior='padding'>
			{/* 헤더 */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.iconContainer}
					onPress={() =>
						stackNavigation.reset({
							index: 0,
							routes: [{ name: 'Chat' }],
						})
					}
				>
					<Ionicons
						name='chevron-back-outline'
						size={24}
						color={Colors.font_black}
					/>
				</TouchableOpacity>
				{receiverInfo?.photoURL ? (
					<Image
						source={{ uri: receiverInfo.photoURL }}
						style={styles.profileImage}
					/>
				) : (
					<Image
						source={require('../assets/images/empty_profile_image.png')}
						style={styles.profileImage}
					/>
				)}

				<Text style={styles.displayName}>{receiverInfo.displayName}</Text>
				<ActionSheetButton
					color={Colors.font_gray}
					size={24}
					options={[
						{ label: '나가기', onPress: leaveChat },
						{ label: '취소', onPress: () => {} },
					]}
				/>
			</View>

			{/* 본문 */}
			<FlatList
				ref={flatListRef}
				data={messages}
				keyExtractor={({ id }) => id}
				renderItem={renderMessage}
				contentContainerStyle={styles.content}
				inverted={true}
			/>

			{/* 인풋 */}
			{receiverInfo.displayName !== '탈퇴한 사용자' && (
				<Input
					input={chatInput}
					setInput={setChatInput}
					placeholder='메세지 보내기'
					onPress={onSubmit}
				/>
			)}
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	content: {
		padding: 24,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginLeft: 4,
		marginRight: 8,
	},
	displayName: {
		flex: 1,
		fontSize: 16,
		fontWeight: 'bold',
	},
	iconContainer: {
		padding: 5,
	},
	dateSeparator: {
		alignItems: 'center',
		marginVertical: 8,
	},
	dateSeparatorText: {
		color: Colors.font_gray,
		fontSize: 12,
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

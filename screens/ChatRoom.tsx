import Message from '@/components/Chat/Message';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import Input from '@/components/ui/Input';
import { Colors } from '@/constants/Color';
import { db } from '@/fbase';
import {
	leaveChatRoom,
	markMessagesAsRead,
	sendMessage,
} from '@/firebase/services/chatService';
import { getPublicUserInfo } from '@/firebase/services/userService';
import useLoading from '@/hooks/useLoading';
import { useAuthStore } from '@/stores/AuthStore';
import { ChatRoomRouteProp, ChatStackNavigation } from '@/types/navigation';
import { PublicUserInfo } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
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
	const { LoadingIndicator } = useLoading();
	const stackNavigation = useNavigation<ChatStackNavigation>();
	const userInfo = useAuthStore((state) => state.userInfo);
	const [receiverInfo, setReceiverInfo] = useState<PublicUserInfo | null>(null);
	const [messages, setMessages] = useState<any[]>([]);
	const [chatInput, setChatInput] = useState('');
	const flatListRef = useRef<FlatList>(null);

	const route = useRoute<ChatRoomRouteProp>();
	const { chatId } = route.params;

	// 채팅방에 참여한 유저 정보 가져오기
	useEffect(() => {
		const getReceiverInfo = async () => {
			const receiverId = chatId.split('_').find((id) => id !== userInfo?.uid);
			if (!receiverId) return;

			const receiver = await getPublicUserInfo(receiverId);
			setReceiverInfo(receiver);
		};

		getReceiverInfo();
	}, [chatId, userInfo]);

	// 유저가 채팅방에 들어올 때 markMessagesAsRead 실행
	useEffect(() => {
		const readMessages = async () => {
			if (chatId && userInfo) {
				markMessagesAsRead({ chatId, userId: userInfo.uid });
			}
		};

		readMessages();
	}, [chatId, userInfo]);

	const groupMessagesByDate = (messages: any[]) => {
		const groupedMessages: any[] = [];
		let lastDate = '';

		messages.forEach((message) => {
			const formattedDate = new Date(
				message.createdAt?.toDate(),
			).toLocaleDateString('ko-KR', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});

			if (formattedDate !== lastDate) {
				groupedMessages.push({
					id: `date-${formattedDate}`,
					isDateSeparator: true,
					date: formattedDate,
				});

				lastDate = formattedDate;
			}

			groupedMessages.push(message);
		});

		return groupedMessages.reverse();
	};

	// 메시지 목록(서브컬렉션) 실시간 구독
	useEffect(() => {
		if (!chatId) return;

		const q = query(
			collection(db, 'Chats', chatId, 'Messages'),
			orderBy('createdAt', 'asc'),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const newMessages = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			const groupedMessages = groupMessagesByDate(newMessages);

			setMessages(groupedMessages);
		});

		return () => unsubscribe();
	}, [chatId]);

	const onSubmit = async () => {
		if (!userInfo || !receiverInfo || chatInput === '') return;

		try {
			await sendMessage({
				chatId,
				senderId: userInfo.uid,
				receiverId: receiverInfo.uid,
				message: chatInput.trim(),
			});
		} catch (e) {
			console.log(e);
		} finally {
			setChatInput('');
			scrollToBottom();
		}
	};

	const scrollToBottom = () => {
		flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
	};

	const leaveChat = async ({ chatId }: { chatId: string }) => {
		if (!userInfo) return;

		await leaveChatRoom({ chatId, userId: userInfo.uid });
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

	if (!chatId || !receiverInfo) return <LoadingIndicator />;

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
						{ label: '나가기', onPress: () => leaveChat({ chatId }) },
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
			<Input
				input={chatInput}
				setInput={setChatInput}
				placeholder='메세지 보내기'
				onPress={onSubmit}
			/>
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
});

export default ChatRoom;

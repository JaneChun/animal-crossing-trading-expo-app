import ActionSheetButton from '@/components/ui/ActionSheetButton';
import Input from '@/components/ui/Input';
import { Colors } from '@/constants/Color';
import { db } from '@/fbase';
import {
	leaveChatRoom,
	markMessagesAsRead,
	sendMessage,
} from '@/firebase/services/chatService';
import { useAuthStore } from '@/stores/AuthStore';
import { ChatRoomRouteProp, ChatStackNavigation } from '@/types/navigation';
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
	const stackNavigation = useNavigation<ChatStackNavigation>();
	const userInfo = useAuthStore((state) => state.userInfo);
	const [messages, setMessages] = useState<any[]>([]);
	const [chatInput, setChatInput] = useState('');
	const flatListRef = useRef<FlatList>(null);

	const route = useRoute<ChatRoomRouteProp>();
	const { chatId, receiverInfo } = route.params;

	// 유저가 채팅방에 들어올 때 markMessagesAsRead 실행
	useEffect(() => {
		const readMessages = async () => {
			if (chatId && userInfo) {
				markMessagesAsRead({ chatId, userId: userInfo.uid });
			}
		};

		readMessages();
	}, [chatId, userInfo]);

	// 메시지 목록(서브컬렉션) 실시간 구독
	useEffect(() => {
		if (!chatId) return;

		const q = query(
			collection(db, 'Chats', chatId, 'Messages'),
			orderBy('createdAt', 'desc'),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const newMessages = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setMessages(newMessages);
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
		const formattedDate = item.createdAt
			.toDate()
			.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

		return item.senderId === userInfo?.uid ? (
			<View style={[styles.messageContainer, { alignSelf: 'flex-end' }]}>
				<Text style={styles.messageTime}>{formattedDate}</Text>
				<View style={[styles.messageBubble, styles.sentBackground]}>
					<Text style={styles.sentText}>{item.body}</Text>
				</View>
			</View>
		) : (
			<View style={[styles.messageContainer, { alignSelf: 'flex-start' }]}>
				<View style={[styles.messageBubble, styles.receivedBackground]}>
					<Text style={styles.receivedText}>{item.body}</Text>
				</View>
				<Text style={styles.messageTime}>{formattedDate}</Text>
				{item.isReadBy.includes(receiverInfo.uid) && (
					<Text style={styles.readText}>읽음</Text>
				)}
			</View>
		);
	};

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
	messageContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 6,
		marginVertical: 8,
	},
	messageBubble: {
		maxWidth: '75%',
		padding: 10,
		borderRadius: 8,
	},
	sentBackground: {
		backgroundColor: Colors.primary,
	},
	receivedBackground: {
		backgroundColor: Colors.border_gray,
	},
	sentText: {
		fontSize: 14,
		color: 'white',
	},
	receivedText: {
		fontSize: 14,
		color: Colors.font_black,
	},
	messageTime: {
		fontSize: 10,
		color: Colors.font_gray,
	},
	readText: {
		fontSize: 10,
		color: Colors.font_gray,
		paddingBottom: 1,
	},
});

export default ChatRoom;

import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/fbase';
import { ChatRoomRouteProp, MyChatStackNavigation } from '@/types/navigation';
import { sendMessage } from '@/utilities/firebaseApi';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
	collection,
	doc,
	onSnapshot,
	orderBy,
	query,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	FlatList,
	Image,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

const ChatRoom = () => {
	const navigation = useNavigation<MyChatStackNavigation>();
	const { userInfo } = useAuthContext();
	const [chat, setChat] = useState<any | null>(null); // 타입
	const [messages, setMessages] = useState<any[]>([]);

	const [chatInput, setChatInput] = useState('');

	const route = useRoute<ChatRoomRouteProp>();
	const { chatId, receiverInfo } = route.params;

	// 🔹 ✅ 채팅방 정보 실시간 구독
	useEffect(() => {
		if (!chatId) return;

		const chatRef = doc(db, 'Chats', chatId);
		const unsubscribe = onSnapshot(chatRef, (doc) => {
			if (doc.exists()) {
				setChat(doc.data()); // ✅ 채팅방 정보 업데이트
			} else {
				console.log('채팅방이 존재하지 않습니다.');
			}
		});

		return () => unsubscribe(); // ✅ 언마운트 시 리스너 해제
	}, [chatId]);

	// 🔹 ✅ 메시지 목록 실시간 구독 (서브컬렉션)
	useEffect(() => {
		if (!chatId) return;

		const messagesRef = collection(db, 'Chats', chatId, 'Messages');
		const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

		const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
			const newMessages = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setMessages(newMessages);
		});

		return () => unsubscribe();
	}, [chatId]);

	const handleSend = async () => {
		// if (participants.length === 1 || chatInput === '') return;
		if (!userInfo || chatInput === '') return;

		try {
			await sendMessage({
				chatId,
				senderId: userInfo.uid,
				message: chatInput,
			});
		} catch (e) {
			console.log(e);
		} finally {
			setChatInput('');
		}
	};

	const confirmLeaveChat = () => {
		Alert.alert('채팅 나가기', '정말 나가겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{ text: '확인', onPress: () => handleLeaveChat({ chatId: chat.id }) },
		]);
	};

	const handleLeaveChat = async ({ chatId }: { chatId: string }) => {
		// if (!userInfo) return;
		// try {
		// 	const chatRef = doc(db, 'Chats', chatId);
		// 	const chatSnapshot = await getDoc(chatRef);
		// 	if (!chatSnapshot.exists()) {
		// 		console.log('채팅방이 존재하지 않습니다.');
		// 		return;
		// 	}
		// 	const chatData = chatSnapshot.data();
		// 	const { participants } = chatData;
		// 	// 유저가 유일한 참여자인 경우 → 채팅방 삭제
		// 	if (participants.length === 1) {
		// 		await deleteDoc(chatRef);
		// 		console.log(`채팅방 ${chatId} 삭제됨`);
		// 	} else {
		// 		// 유저가 채팅방을 나갈 때, participants 배열에서 제거
		// 		await updateDoc(chatRef, {
		// 			participants: arrayRemove(userInfo.uid),
		// 		});
		// 		console.log(`${userInfo.displayName} 유저가 채팅방을 나갔습니다.`);
		// 	}
		// } catch (e) {
		// 	console.log('채팅방 나가기 중 오류 발생:', e);
		// }
	};

	const renderMessage = ({ item }: { item: any }) => (
		<View
			style={[
				styles.messageContainer,
				item.senderId === userInfo?.uid
					? styles.sentMessage
					: styles.receivedMessage,
			]}
		>
			<Text style={styles.messageText}>{item.body}</Text>
			<Text style={styles.messageTime}>
				{item.createdAt.toDate().toLocaleTimeString().slice(0, -3)}
			</Text>
		</View>
	);

	return (
		<KeyboardAvoidingView style={styles.container} behavior='padding'>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.navigate('Chat')}>
					<FontAwesome name='arrow-left' size={24} color='black' />
				</TouchableOpacity>
				<Image
					source={{ uri: receiverInfo.creatorPhotoURL }}
					style={styles.profileImage}
				/>
				<Text style={styles.userName}>{receiverInfo.creatorDisplayName}</Text>
				<TouchableOpacity onPress={confirmLeaveChat}>
					<FontAwesome name='ellipsis-v' size={24} color='black' />
				</TouchableOpacity>
			</View>

			<FlatList
				// ref={messageEndRef}
				data={messages}
				keyExtractor={(item) => item.id}
				renderItem={renderMessage}
				contentContainerStyle={styles.messageList}
			/>

			<View style={styles.inputContainer}>
				<TextInput
					value={chatInput}
					onChangeText={setChatInput}
					placeholder={
						chat?.participants.length === 1
							? '대화 상대가 없습니다.'
							: '메시지를 입력하세요.'
					}
					style={styles.input}
					editable={chat?.participants.length > 1}
				/>
				<TouchableOpacity
					onPress={handleSend}
					disabled={chat?.participants.length === 1}
				>
					<FontAwesome
						name='paper-plane'
						size={24}
						color={chat?.participants.length === 1 ? 'gray' : '#0cc6b6'}
					/>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#ddd',
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginHorizontal: 10,
	},
	userName: { flex: 1, fontSize: 16, fontWeight: 'bold' },
	messageList: { padding: 16 },
	messageContainer: {
		padding: 10,
		borderRadius: 8,
		marginVertical: 4,
		maxWidth: '75%',
	},
	sentMessage: { alignSelf: 'flex-end', backgroundColor: '#0cc6b6' },
	receivedMessage: { alignSelf: 'flex-start', backgroundColor: '#e0e0e0' },
	messageText: { fontSize: 14, color: 'white' },
	messageTime: { fontSize: 10, color: '#ccc', marginTop: 4 },
	inputContainer: {
		flexDirection: 'row',
		padding: 10,
		borderTopWidth: 1,
		borderColor: '#ddd',
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 20,
		padding: 10,
		marginRight: 10,
	},
	popupContainer: {
		position: 'absolute',
		bottom: '30%',
		alignSelf: 'center',
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 10,
		shadowOpacity: 0.2,
	},
	popupText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
	ratingContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginVertical: 10,
	},
	confirmButton: { backgroundColor: '#0cc6b6', padding: 10, borderRadius: 5 },
	confirmButtonText: { color: 'white', textAlign: 'center' },
});

export default ChatRoom;

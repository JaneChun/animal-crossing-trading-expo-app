import Input from '@/components/ui/Input';
import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/fbase';
import { ChatRoomRouteProp, MyChatStackNavigation } from '@/types/navigation';
import { sendMessage } from '@/utilities/firebaseApi';
import { Entypo, Ionicons } from '@expo/vector-icons';
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
	Image,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

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

	const onSubmit = async () => {
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
			</View>
		);
	};

	return (
		<View style={styles.screen}>
			<KeyboardAvoidingView style={styles.container} behavior='padding'>
				{/* 헤더 */}
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.iconContainer}
						onPress={() => navigation.goBack()}
					>
						<Ionicons
							name='chevron-back-outline'
							size={24}
							color={Colors.font_black}
						/>
					</TouchableOpacity>
					<Image
						source={{ uri: receiverInfo.creatorPhotoURL }}
						style={styles.profileImage}
					/>
					<Text style={styles.displayName}>
						{receiverInfo.creatorDisplayName}
					</Text>
					<TouchableOpacity
						style={styles.iconContainer}
						onPress={confirmLeaveChat}
					>
						<Entypo
							name='dots-three-vertical'
							size={18}
							color={Colors.font_black}
						/>
					</TouchableOpacity>
				</View>

				{/* 본문 */}
				<FlatList
					data={messages}
					keyExtractor={({ id }) => id}
					renderItem={renderMessage}
					contentContainerStyle={styles.content}
				/>

				{/* 인풋 */}
				<Input
					input={chatInput}
					setInput={setChatInput}
					placeholder='메세지 보내기'
					onPress={onSubmit}
				/>
			</KeyboardAvoidingView>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
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
});

export default ChatRoom;

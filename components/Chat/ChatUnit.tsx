import { Colors } from '@/constants/Color';
import { leaveChatRoom } from '@/firebase/services/chatService';
import { useAuthStore } from '@/stores/AuthStore';
import { ChatWithReceiverInfo } from '@/types/chat';
import { ChatStackNavigation } from '@/types/navigation';
import { elapsedTime } from '@/utilities/elapsedTime';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
	Alert,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
	SharedValue,
	useAnimatedStyle,
} from 'react-native-reanimated';

const ChatUnit = (props: ChatWithReceiverInfo) => {
	const {
		id,
		lastMessage,
		lastMessageSenderId,
		participants,
		unreadCount,
		updatedAt,
		receiverInfo,
	} = props;
	const stackNavigation = useNavigation<ChatStackNavigation>();
	const userInfo = useAuthStore((state) => state.userInfo);

	const enterChatRoom = ({ chatId }: { chatId: string }) => {
		stackNavigation.navigate('ChatRoom', { chatId });
	};

	const deleteChat = async (id: string) => {
		const title = receiverInfo.displayName || '채팅방 나가기';
		Alert.alert(title, '채팅방을 나가시겠어요?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '나가기',
				onPress: async () => await handleLeaveChat({ chatId: id }),
			},
		]);
	};

	const handleLeaveChat = async ({ chatId }: { chatId: string }) => {
		if (!userInfo) return;

		await leaveChatRoom({ chatId, userId: userInfo.uid });
	};

	const unreadMessageCount = userInfo ? unreadCount?.[userInfo.uid] ?? 0 : 0;

	const RightAction = (
		prog: SharedValue<number>,
		drag: SharedValue<number>,
	) => {
		const animatedStyle = useAnimatedStyle(() => {
			return {
				transform: [{ translateX: drag.value + 80 }],
			};
		});

		return (
			<Reanimated.View style={animatedStyle}>
				<TouchableOpacity
					style={styles.rightActionContainer}
					onPress={async () => await deleteChat(id)}
				>
					<FontAwesome name='trash' color='white' size={24} />
				</TouchableOpacity>
			</Reanimated.View>
		);
	};

	return (
		<Swipeable friction={2} renderRightActions={RightAction}>
			<TouchableOpacity
				onPress={() => enterChatRoom(id)}
				style={styles.container}
			>
				<View style={styles.header}>
					{receiverInfo?.photoURL ? (
						<Image
							source={{ uri: receiverInfo.photoURL }}
							style={styles.profileImage}
						/>
					) : (
						<Image
							source={require('../../assets/images/empty_profile_image.png')}
							style={styles.profileImage}
						/>
					)}
				</View>
				<View style={styles.body}>
					<View style={styles.title}>
						<Text style={styles.chatUserName}>{receiverInfo.displayName}</Text>
						<Text style={styles.chatTime}>{elapsedTime(updatedAt)}</Text>
					</View>
					<View style={styles.content}>
						<Text style={styles.lastMessage} numberOfLines={1}>
							{lastMessage}
						</Text>
						{unreadMessageCount > 0 && (
							<Text style={styles.count}>{unreadMessageCount.toString()}</Text>
						)}
					</View>
				</View>
			</TouchableOpacity>
		</Swipeable>
	);
};

export default ChatUnit;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	header: {},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
	},
	body: {
		flex: 1,
		marginLeft: 12,
	},
	title: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	chatUserName: {
		fontSize: 16,
		fontWeight: '600',
		color: Colors.font_black,
	},
	chatTime: {
		fontSize: 12,
		color: Colors.primary,
	},
	content: {
		flexDirection: 'row',
		marginTop: 4,
		alignItems: 'center',
	},
	count: {
		borderRadius: 25,
		backgroundColor: Colors.badge_red,
		color: 'white',
		paddingVertical: 2,
		paddingHorizontal: 7,
	},
	lastMessage: {
		flex: 1,
		fontSize: 14,
		color: Colors.font_gray,
	},
	rightActionContainer: {
		backgroundColor: Colors.badge_red,
		width: 80,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

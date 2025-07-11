import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { getSafeUid, leaveChatRoom } from '@/firebase/services/chatService';
import { useUserInfo } from '@/stores/auth';
import { ChatWithReceiverInfo } from '@/types/chat';
import { elapsedTime } from '@/utilities/elapsedTime';
import { navigateToChatRoom } from '@/utilities/navigationHelpers';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
	Alert,
	Pressable,
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
import ImageWithFallback from '../ui/ImageWithFallback';

const ChatUnit = (props: ChatWithReceiverInfo) => {
	const { id, lastMessage, unreadCount, updatedAt, receiverInfo } = props;
	const userInfo = useUserInfo();

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

	const unreadMessageCount = userInfo
		? unreadCount?.[getSafeUid(userInfo.uid)] ?? 0
		: 0;

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
			<Pressable
				onPress={() => navigateToChatRoom({ chatId: id })}
				style={styles.container}
			>
				<View style={styles.header}>
					<ImageWithFallback
						uri={receiverInfo?.photoURL}
						fallbackSource={require('../../assets/images/empty_profile_image.png')}
						style={styles.profileImage}
					/>
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
			</Pressable>
		</Swipeable>
	);
};

export default ChatUnit;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingVertical: 12,
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
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
	},
	chatTime: {
		fontSize: FontSizes.xs,
		color: Colors.font_gray,
		fontWeight: FontWeights.regular,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 4,
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
		fontSize: FontSizes.sm,
		color: Colors.font_gray,
		fontWeight: FontWeights.light,
	},
	rightActionContainer: {
		backgroundColor: Colors.badge_red,
		width: 80,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

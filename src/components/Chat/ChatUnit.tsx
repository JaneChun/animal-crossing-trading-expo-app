import { FontAwesome } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { getSafeUid, leaveChatRoom } from '@/firebase/services/chatService';
import { useUserInfo } from '@/stores/auth';
import { Theme, useThemedStyles } from '@/theme';
import { ChatWithReceiverInfo } from '@/types/chat';
import { elapsedTime } from '@/utilities/elapsedTime';
import { navigateToChatRoom } from '@/utilities/navigationHelpers';
import emptyProfileImage from '@assets/images/empty_profile_image.png';

const ChatUnit = (props: ChatWithReceiverInfo) => {
	const { id, lastMessage, unreadCount, updatedAt, receiverInfo } = props;
	const styles = useThemedStyles(makeStyles);
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

	const unreadMessageCount = userInfo ? (unreadCount?.[getSafeUid(userInfo.uid)] ?? 0) : 0;

	const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
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
					<FontAwesome name="trash" color={styles.trashIcon.color} size={24} />
				</TouchableOpacity>
			</Reanimated.View>
		);
	};

	return (
		<Swipeable friction={2} renderRightActions={RightAction}>
			<Pressable onPress={() => navigateToChatRoom({ chatId: id })} style={styles.container}>
				<View style={styles.header}>
					<ImageWithFallback
						uri={receiverInfo?.photoURL}
						fallbackSource={emptyProfileImage}
						style={styles.profileImage}
					/>
				</View>
				<View style={styles.body}>
					<View style={styles.title}>
						<Text variant="body1" weight="semibold">
							{receiverInfo.displayName}
						</Text>
						<Text variant="caption" color="tertiary">
							{elapsedTime(updatedAt)}
						</Text>
					</View>
					<View style={styles.content}>
						<Text
							variant="body2"
							weight="light"
							color="tertiary"
							style={styles.lastMessage}
							numberOfLines={1}
						>
							{lastMessage}
						</Text>
						{unreadMessageCount > 0 && (
							<Text variant="body2" color="onBrand" style={styles.count}>
								{unreadMessageCount.toString()}
							</Text>
						)}
					</View>
				</View>
			</Pressable>
		</Swipeable>
	);
};

export default ChatUnit;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 24,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
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
		content: {
			flexDirection: 'row',
			alignItems: 'center',
			marginTop: 4,
		},
		count: {
			borderRadius: 25,
			backgroundColor: colors.status.danger,
			paddingVertical: 2,
			paddingHorizontal: 7,
		},
		lastMessage: {
			flex: 1,
		},
		rightActionContainer: {
			backgroundColor: colors.status.danger,
			width: 80,
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		},
		trashIcon: {
			color: colors.text.onBrand,
		},
	});

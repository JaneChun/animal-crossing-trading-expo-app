import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { ChatWithReceiverInfo } from '@/types/chat';
import { ChatStackNavigation } from '@/types/navigation';
import { PublicUserInfo } from '@/types/user';
import { elapsedTime } from '@/utilities/elapsedTime';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
	const { userInfo } = useAuthContext();

	const enterChatRoom = ({
		chatId,
		receiverInfo,
	}: {
		chatId: string;
		receiverInfo: PublicUserInfo;
	}) => {
		stackNavigation.navigate('ChatRoom', { chatId, receiverInfo });
	};

	const unreadMessageCount = userInfo ? unreadCount?.[userInfo.uid] ?? 0 : 0;

	return (
		<TouchableOpacity
			onPress={() => enterChatRoom({ chatId: id, receiverInfo })}
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
});

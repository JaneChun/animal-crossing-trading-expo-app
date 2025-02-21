import Layout from '@/components/ui/Layout';
import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import useGetChats, {
	Chat as ChatType,
	ReceiverInfo,
} from '@/hooks/useGetChats';
import { ChatStackNavigation } from '@/types/navigation';
import { elapsedTime } from '@/utilities/elapsedTime';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const Chat = () => {
	const stackNavigation = useNavigation<ChatStackNavigation>();
	const { userInfo } = useAuthContext();
	const { chats } = useGetChats();

	const enterChatRoom = ({
		chatId,
		receiverInfo,
	}: {
		chatId: string;
		receiverInfo: ReceiverInfo;
	}) => {
		stackNavigation.navigate('ChatRoom', { chatId, receiverInfo });
	};

	const renderChatItem = ({ item }: { item: ChatType }) => {
		const {
			id,
			lastMessage,
			lastMessageSenderId,
			participants,
			updatedAt,
			receiverInfo,
		} = item;

		return (
			<TouchableOpacity
				onPress={() => enterChatRoom({ chatId: id, receiverInfo })}
				style={styles.chatItem}
			>
				<Image
					source={{ uri: receiverInfo.creatorPhotoURL }}
					style={styles.profileImage}
				/>
				<View style={styles.chatInfo}>
					<View style={styles.chatHeader}>
						<Text style={styles.chatUserName}>
							{receiverInfo.creatorDisplayName}
						</Text>
						<Text style={styles.chatTime}>{elapsedTime(updatedAt)}</Text>
					</View>
					<Text style={styles.lastMessage} numberOfLines={1}>
						{lastMessage}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<Layout title='채팅'>
			{chats.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>참여 중인 채팅방이 없습니다.</Text>
				</View>
			) : (
				<FlatList
					data={chats}
					keyExtractor={({ id }) => id}
					renderItem={renderChatItem}
				/>
			)}
		</Layout>
	);
};

const styles = StyleSheet.create({
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 14,
		color: Colors.font_gray,
	},
	chatItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
	},
	chatInfo: {
		flex: 1,
		marginLeft: 12,
	},
	chatHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	chatUserName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	chatTime: {
		fontSize: 12,
		color: Colors.primary,
	},
	lastMessage: {
		fontSize: 14,
		color: '#666',
		marginTop: 4,
	},
});

export default Chat;

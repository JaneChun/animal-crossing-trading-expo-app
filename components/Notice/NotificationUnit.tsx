import { Colors } from '@/constants/Color';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { useDeleteNotification } from '@/hooks/mutation/notification/useDeleteNotification';
import { useMarkAsRead } from '@/hooks/mutation/notification/useMarkAsRead';
import { usePostDetail } from '@/hooks/query/post/usePostDetail';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { NotificationUnitProp } from '@/types/components';
import { NoticeStackNavigation } from '@/types/navigation';
import { Collection } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { elapsedTime } from '@/utilities/elapsedTime';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
	SharedValue,
	useAnimatedStyle,
} from 'react-native-reanimated';
import ItemThumbnail from '../ui/ItemThumbnail';
import Thumbnail from '../ui/Thumbnail';

const NotificationUnit = ({ item, collectionName }: NotificationUnitProp) => {
	const { isBoardPost, isCommunityPost } = usePostContext();

	const stackNavigation = useNavigation<NoticeStackNavigation>();
	const { id, type, body, postId, receiverId, senderId, createdAt, isRead } =
		item;
	const { data: post } = usePostDetail(type, postId);
	const [senderInfo, setSenderInfo] = useState<PublicUserInfo | null>(null);

	const { mutate: markAsRead } = useMarkAsRead(id);
	const { mutate: deleteNotification } = useDeleteNotification(id);

	useEffect(() => {
		const fetchSenderInfo = async () => {
			const sender = await getPublicUserInfo(senderId);
			setSenderInfo(sender);
		};

		fetchSenderInfo();
	}, []);

	let title = '게시글';
	if (post?.title) {
		title =
			post.title.length > 5 ? `${post.title.substring(0, 5)}...` : post.title;
	}

	const onPressNotification = async ({
		collectionName,
		postId,
	}: {
		collectionName: Collection;
		postId: string;
	}) => {
		markAsRead(undefined, {
			onSuccess: () => {
				stackNavigation.navigate('PostDetail', {
					id: postId,
					collection: collectionName,
				});
			},
		});
	};

	const handleDeleteNotification = async (notificationId: string) => {
		deleteNotification();
	};

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
					onPress={() => handleDeleteNotification(id)}
				>
					<FontAwesome name='trash' color='white' size={24} />
				</TouchableOpacity>
			</Reanimated.View>
		);
	};

	if (!post || !senderInfo) return null;

	return (
		<Swipeable friction={2} renderRightActions={RightAction}>
			<TouchableOpacity
				style={[
					styles.container,
					isRead ? styles.readBackground : styles.unreadBackground,
				]}
				onPress={() => onPressNotification({ postId, collectionName })}
				activeOpacity={0.8}
			>
				{/* 썸네일 */}
				<View style={styles.thumbnailContainer}>
					{isBoardPost(post, collectionName) && (
						<ItemThumbnail
							previewImage={post?.cart?.[0]?.imageUrl}
							itemLength={post?.cart?.length}
						/>
					)}
					{isCommunityPost(post, collectionName) && (
						<Thumbnail previewImage={post?.images?.[0]} />
					)}
				</View>

				{/* 콘텐츠 */}
				<View style={styles.content}>
					<Text style={styles.title} numberOfLines={2}>
						<Text style={styles.boldText}>{senderInfo.displayName}</Text>님이{' '}
						<Text style={styles.boldText}>{title}</Text>에 댓글을 남겼습니다.
					</Text>
					<Text style={styles.body} numberOfLines={2}>
						"{body}"
					</Text>
					<Text style={styles.date}>{elapsedTime(createdAt)}</Text>
				</View>
			</TouchableOpacity>
		</Swipeable>
	);
};

export default NotificationUnit;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderColor: Colors.border_gray,
		gap: 16,
	},
	unreadBackground: {
		backgroundColor: Colors.base,
	},
	readBackground: {
		backgroundColor: 'white',
	},
	thumbnailContainer: {
		flexShrink: 0,
	},
	content: {
		flex: 1,
	},
	title: {
		color: Colors.font_gray,
		marginBottom: 4,
	},
	boldText: {
		fontWeight: 600,
		color: Colors.font_black,
	},
	body: {
		marginTop: 4,
		fontSize: 14,
		color: Colors.font_gray,
	},
	date: {
		marginTop: 6,
		fontSize: 12,
		color: Colors.font_light_gray,
		textAlign: 'right',
	},
	rightActionContainer: {
		backgroundColor: Colors.badge_red,
		width: 80,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

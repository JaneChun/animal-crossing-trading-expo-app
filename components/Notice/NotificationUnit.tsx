import { Colors } from '@/constants/Color';
import { getPost } from '@/firebase/services/postService';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { NotificationUnitProp } from '@/types/components';
import { Post } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { elapsedTime } from '@/utilities/elapsedTime';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ItemThumbnail from '../ui/ItemThumbnail';
import Thumbnail from '../ui/Thumbnail';

const NotificationUnit = ({ tab, item }: NotificationUnitProp) => {
	const { id, type, body, postId, receiverId, senderId, createdAt, isRead } =
		item;
	const [post, setPost] = useState<Post | null>(null);
	const [senderInfo, setSenderInfo] = useState<PublicUserInfo | null>(null);

	useEffect(() => {
		const fetchPost = async () => {
			const postData = await getPost(type, postId);
			setPost(postData);
		};
		const fetchSenderInfo = async () => {
			const sender = await getPublicUserInfo(senderId);
			setSenderInfo(sender);
		};

		fetchPost();
		fetchSenderInfo();
	}, []);

	let title = '게시글';
	if (post?.title) {
		title =
			post.title.length > 5 ? `${post.title.substring(0, 5)}...` : post.title;
	}

	const onPressNotification = () => {};

	if (!post || !senderInfo) return null;

	return (
		<TouchableOpacity
			style={[styles.container, isRead ? styles.read : styles.unread]}
			onPress={onPressNotification}
			activeOpacity={0.8}
		>
			{/* 썸네일 */}
			<View style={styles.thumbnailContainer}>
				{tab === 'Market' && (
					<ItemThumbnail
						previewImage={post?.cart?.[0]?.imageUrl}
						itemLength={post?.cart?.length}
					/>
				)}
				{tab === 'Community' && <Thumbnail previewImage={post?.images?.[0]} />}
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
	);
};

export default NotificationUnit;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		padding: 16,
		borderBottomWidth: 1,
		borderColor: Colors.border_gray,
		gap: 16,
	},
	unread: {
		backgroundColor: Colors.base,
	},
	read: {
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
});

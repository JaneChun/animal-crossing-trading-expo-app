import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useDeleteNotification } from '@/hooks/notification/query/mutation/useDeleteNotification';
import { NotificationUnitProp } from '@/types/components';
import { Collection } from '@/types/post';
import { elapsedTime } from '@/utilities/elapsedTime';
import { navigateToPost } from '@/utilities/navigationHelpers';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

const NotificationUnit = ({ item, collectionName }: NotificationUnitProp) => {
	const {
		id,
		type,
		actionType,
		body,
		postId,
		receiverId,
		senderInfo,
		postInfo: post,
		createdAt,
		isRead,
	} = item;

	const { mutate: deleteNotification } = useDeleteNotification(id);

	let title = '게시글';
	if (post?.title) {
		title = post.title.length > 8 ? `${post.title.substring(0, 8)}...` : post.title;
	}

	const onPressNotification = async ({
		collectionName,
		postId,
	}: {
		collectionName: Collection;
		postId: string;
	}) => {
		if (isRead) navigateToPost({ postId, collectionName });
		else navigateToPost({ postId, collectionName, notificationId: id });
	};

	// Swipeable이 스와이프될 때 보여줄 삭제 버튼을 생성
	const renderRightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
		// 스와이프 시 드래그한 거리(drag.value)에 따라 삭제 버튼 위치 조정
		const animatedStyle = useAnimatedStyle(() => {
			return {
				transform: [{ translateX: drag.value + 80 }],
			};
		}, [drag]);

		return (
			<Reanimated.View style={[styles.rightActionContainer, animatedStyle]}>
				<Pressable style={styles.rightActionButton} onPress={() => deleteNotification()}>
					<FontAwesome name='trash' color='white' size={24} />
				</Pressable>
			</Reanimated.View>
		);
	};

	if (!post) return null;

	return (
		<Swipeable friction={2} renderRightActions={renderRightAction}>
			<Pressable
				style={[styles.container, isRead ? styles.readBackground : styles.unreadBackground]}
				onPress={() => onPressNotification({ postId, collectionName })}
			>
				{/* 콘텐츠 */}
				<View style={styles.content}>
					<Text style={styles.title} numberOfLines={2}>
						<Text style={styles.highlight}>
							{senderInfo?.displayName ?? DEFAULT_USER_DISPLAY_NAME}
						</Text>
						<Text>님이 </Text>
						<Text style={styles.highlight}>{title}</Text>
						<Text>{`에 ${actionType === 'reply' ? '답글' : '댓글'}을 남겼습니다.`}</Text>
					</Text>
					<Text style={styles.body} numberOfLines={2}>
						"{body}"
					</Text>
					<Text style={styles.date}>{elapsedTime(createdAt)}</Text>
				</View>

				{/* 썸네일 */}
				{/* <View style={styles.thumbnailContainer}>
					{isBoardPost(post, collectionName) && (
						<ItemThumbnail
							previewImage={post?.cart?.[0]?.imageUrl}
							itemLength={post?.cart?.length}
						/>
					)}
					{isCommunityPost(post, collectionName) && (
						<Thumbnail previewImage={post?.images?.[0]} />
					)}
				</View> */}
			</Pressable>
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
		fontWeight: FontWeights.regular,
		marginBottom: 4,
	},
	highlight: {
		color: Colors.font_black,
		// fontWeight: FontWeights.semibold,
	},
	body: {
		marginTop: 4,
		fontSize: FontSizes.sm,
		color: Colors.font_gray,
	},
	date: {
		marginTop: 6,
		fontSize: FontSizes.xs,
		color: Colors.font_gray,
		textAlign: 'right',
	},
	rightActionContainer: {
		backgroundColor: Colors.badge_red,
		width: 80,
	},
	rightActionButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

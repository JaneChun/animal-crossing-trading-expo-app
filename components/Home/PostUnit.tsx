import { Colors } from '@/constants/Color';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { PostUnitProps } from '@/types/components';
import { Collection } from '@/types/post';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { elapsedTime } from '../../utilities/elapsedTime';
import CommunityTypeBadge from '../Community/CommunityTypeBadge';
import ItemThumbnail from '../ui/ItemThumbnail';
import Thumbnail from '../ui/Thumbnail';
import MarketTypeBadge from './MarketTypeBadge';

const PostUnit = <C extends Collection>({
	post,
	collectionName,
}: PostUnitProps<C>) => {
	const { isBoardPost, isCommunityPost } = usePostContext();

	const stackNavigation = useNavigation();

	const navigateToPost = () => {
		stackNavigation.navigate('PostDetail', { id: post.id, collectionName });
	};

	return (
		<TouchableOpacity style={styles.container} onPress={navigateToPost}>
			{/* 썸네일 */}
			<View style={styles.thumbnailContainer}>
				{isBoardPost(post, collectionName) && (
					<ItemThumbnail
						previewImage={post.cart?.[0]?.imageUrl}
						itemLength={post.cart?.length}
					/>
				)}
				{isCommunityPost(post, collectionName) && (
					<Thumbnail previewImage={post.images?.[0]} />
				)}
			</View>

			{/* 콘텐츠 */}
			<View style={styles.contentContainer}>
				<View style={styles.titleContainer}>
					{isBoardPost(post, collectionName) && (
						<MarketTypeBadge type={post.type} />
					)}
					{isCommunityPost(post, collectionName) && (
						<CommunityTypeBadge type={post.type} />
					)}
					<Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>
						{post.title}
					</Text>
				</View>
				<Text style={styles.infoText}>
					<Text style={styles.creator}>{post.creatorDisplayName} </Text>
					<Text style={styles.date}> {elapsedTime(post.createdAt)}</Text>
				</Text>
			</View>

			{/* 댓글 */}
			<View style={styles.commentContainer}>
				<Text style={styles.commentLabel}>댓글</Text>
				<Text style={styles.commentCount}>{post.commentCount}</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	thumbnailContainer: {
		flexShrink: 0,
		// borderWidth: 1,
	},
	contentContainer: {
		flex: 1,
		marginLeft: 12,
	},
	titleContainer: {
		flex: 1,
		height: 30,
		flexDirection: 'row',
		alignItems: 'center',
	},
	title: {
		flexShrink: 1,
		fontSize: 16,
		fontWeight: 600,
		color: Colors.font_black,
	},
	infoText: {
		fontSize: 14,
		marginTop: 4,
	},
	creator: {
		fontWeight: '500',
		color: Colors.font_gray,
	},
	date: {
		fontSize: 14,
		color: Colors.font_light_gray,
	},
	commentContainer: {
		width: 50,
		flexDirection: 'column',
		gap: 6,
		alignItems: 'center',
	},
	commentLabel: {
		fontSize: 12,
		fontWeight: 600,
		color: Colors.font_black,
	},
	commentCount: {
		fontSize: 16,
		fontWeight: 'bold',
		color: Colors.font_black,
	},
});

export default PostUnit;

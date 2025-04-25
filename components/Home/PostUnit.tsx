import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { PostUnitProps } from '@/types/components';
import { Collection } from '@/types/post';
import { elapsedTime } from '@/utilities/elapsedTime';
import { navigateToPost } from '@/utilities/navigationHelpers';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CommunityTypeBadge from '../Community/CommunityTypeBadge';
import ItemThumbnail from '../ui/ItemThumbnail';
import Thumbnail from '../ui/Thumbnail';
import MarketTypeBadge from './MarketTypeBadge';

const PostUnit = <C extends Collection>({
	post,
	collectionName,
}: PostUnitProps<C>) => {
	const { isBoardPost, isCommunityPost } = usePostContext();

	return (
		<TouchableOpacity
			style={styles.container}
			onPress={() => navigateToPost({ postId: post.id, collectionName })}
		>
			{/* 콘텐츠 */}
			<View style={styles.topRow}>
				<View style={styles.typeAndTitle}>
					{/* 배지 */}
					<View style={{ flexDirection: 'row' }}>
						{isBoardPost(post, collectionName) && (
							<MarketTypeBadge type={post.type} />
						)}
						{isCommunityPost(post, collectionName) && (
							<CommunityTypeBadge type={post.type} />
						)}
					</View>
					{/* 타이틀 */}
					<Text style={styles.title} numberOfLines={2} ellipsizeMode='tail'>
						{post.title}
					</Text>
				</View>

				{/* 썸네일 */}
				<View style={styles.thumbnail}>
					{isBoardPost(post, collectionName) && (
						<ItemThumbnail
							previewImage={post.cart?.[0]?.imageUrl}
							itemLength={post.cart?.length}
						/>
						// <Thumbnail previewImage={post.cart?.[0]?.imageUrl} />
					)}
					{isCommunityPost(post, collectionName) && (
						<Thumbnail previewImage={post.images?.[0]} />
					)}
				</View>
			</View>

			{/* 작성자, 시간, 댓글 */}
			<View style={styles.bottomRow}>
				<View style={styles.infoContainer}>
					<Text style={styles.infoText}>{post.creatorDisplayName} </Text>
					<Text style={styles.infoText}>{elapsedTime(post.createdAt)}</Text>
				</View>
				<View style={styles.commentContainer}>
					<View style={styles.commentBox}>
						<MaterialIcons
							name='mode-comment'
							color={Colors.icon_gray}
							size={15}
						/>
						<Text style={styles.infoText}>{post.commentCount}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 18,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	thumbnail: {
		flexShrink: 0,
	},
	topRow: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 8,
	},
	typeAndTitle: {
		gap: 6,
	},
	title: {
		flexShrink: 1,
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
	},
	bottomRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	infoContainer: {
		flexDirection: 'row',
		gap: 2,
		marginTop: 2,
	},
	infoText: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.regular,
		color: Colors.font_gray,
	},
	commentContainer: {
		width: 30,
	},
	commentBox: {
		flexDirection: 'row',
		gap: 2,
	},
});

export default PostUnit;

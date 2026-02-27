import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import CommunityTypeBadge from '@/components/Community/CommunityTypeBadge';
import MarketTypeBadge from '@/components/Home/MarketTypeBadge';
import ItemThumbnail from '@/components/ui/ItemThumbnail';
import Thumbnail from '@/components/ui/Thumbnail';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { PostSummaryProps } from '@/types/components';
import { Collection } from '@/types/post';
import { navigateToPost } from '@/utilities/navigationHelpers';
import { isBoardPost, isCommunityPost } from '@/utilities/typeGuards/postTypeGuards';

const PostSummary = <C extends Collection>({ post, collectionName }: PostSummaryProps<C>) => {
	return (
		<Pressable
			style={styles.container}
			onPress={() => navigateToPost({ postId: post.id, collectionName })}
			testID="postSummaryButton"
		>
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
			<View style={styles.infoContainer}>
				<View style={styles.titleContainer}>
					{isBoardPost(post, collectionName) && <MarketTypeBadge type={post.type} />}
					{isCommunityPost(post, collectionName) && (
						<CommunityTypeBadge type={post.type} />
					)}
					<Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
						{post.title}
					</Text>
				</View>
			</View>

			{/* 아이콘 */}
			<View>
				<Ionicons
					name="arrow-forward-circle-outline"
					size={24}
					color={Colors.brand.primary}
				/>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16,
		height: 70,
		backgroundColor: Colors.bg.primary,
		borderRadius: 8,
	},
	thumbnailContainer: {
		flexShrink: 0,
	},
	infoContainer: {
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
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.text.primary,
	},
});

export default PostSummary;

import { MaterialIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import CommunityTypeBadge from '@/components/Community/CommunityTypeBadge';
import ItemThumbnail from '@/components/ui/ItemThumbnail';
import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';
import { PostUnitProps } from '@/types/components';
import { Collection } from '@/types/post';
import { logFeedItemClick } from '@/utilities/analytics';
import { elapsedTime } from '@/utilities/elapsedTime';
import { navigateToPost } from '@/utilities/navigationHelpers';
import { isBoardPost, isCommunityPost } from '@/utilities/typeGuards/postTypeGuards';

import CommunityThumbnail from './CommunityThumbnail';
import MarketTypeBadge from './MarketTypeBadge';

/**
 * 제목이 한 줄인 항목의 높이 — 배지 25 + 간격 6 + 제목 24 + 간격 10 + 작성자·시간 17 + 위아래 여백 20 + 구분선 1.
 * 제목이 두 줄이면 항목이 이보다 길어진다.
 */
export const POST_UNIT_MIN_HEIGHT = 103;

const PostUnit = <C extends Collection>({
	post,
	collectionName,
	index,
}: PostUnitProps<C>) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<Pressable
			style={styles.container}
			onPress={() => {
				logFeedItemClick(collectionName, index);
				navigateToPost({ postId: post.id, collectionName });
			}}
			testID={index === 0 ? 'firstPostUnit' : `postUnit-${index}`}
		>
			<>
				{/* 콘텐츠 */}
				<View style={styles.topRow}>
					<View style={styles.typeAndTitle}>
						{/* 배지 */}
						<View style={styles.badgeContainer}>
							{isBoardPost(post, collectionName) && (
								<MarketTypeBadge type={post.type} />
							)}
							{isCommunityPost(post, collectionName) && (
								<CommunityTypeBadge type={post.type} />
							)}
						</View>
						{/* 타이틀 */}
						<Text
							variant="body1"
							weight="semibold"
							style={styles.title}
							numberOfLines={2}
							ellipsizeMode="tail"
						>
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
						)}
						{isCommunityPost(post, collectionName) && (
							<CommunityThumbnail images={post.images} villagers={post.villagers} />
						)}
					</View>
				</View>

				{/* 작성자, 시간, 댓글 */}
				<View style={styles.bottomRow}>
					<View style={styles.infoContainer}>
						<Text variant="caption" color="tertiary">
							{post.creatorDisplayName}{' '}
						</Text>
						<Text variant="caption" color="tertiary">
							{elapsedTime(post.createdAt)}
						</Text>
					</View>
					<View style={styles.commentContainer}>
						<View style={styles.commentBox}>
							<MaterialIcons
								name="mode-comment"
								color={styles.commentIcon.color}
								size={15}
							/>
							<Text variant="caption" color="tertiary">
								{post.commentCount}
							</Text>
						</View>
					</View>
				</View>
			</>
		</Pressable>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: 'center',
			minHeight: POST_UNIT_MIN_HEIGHT,
			paddingVertical: 10,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
		},
		topRow: {
			flexDirection: 'row',
			width: '100%',
			gap: 8,
		},
		typeAndTitle: {
			gap: 6,
			flex: 1,
		},
		thumbnail: {
			flexShrink: 0,
			alignSelf: 'flex-end',
		},
		title: {
			flexShrink: 1,
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
		commentIcon: {
			color: colors.icon.default,
		},
		commentContainer: {
			width: 30,
		},
		commentBox: {
			flexDirection: 'row',
			gap: 2,
		},
		badgeContainer: {
			flexDirection: 'row',
		},
	});

export default memo(PostUnit);

import CommunityTypeBadge from '@/components/Community/CommunityTypeBadge';
import MarketTypeBadge from '@/components/Home/MarketTypeBadge';
import Body from '@/components/PostDetail/Body';
import CommentInput from '@/components/PostDetail/CommentInput';
import CommentsList from '@/components/PostDetail/CommentsList';
import CreatedAt from '@/components/PostDetail/CreatedAt';
import ImageCarousel from '@/components/PostDetail/ImageCarousel';
import ItemSummaryList from '@/components/PostDetail/ItemSummaryList';
import Title from '@/components/PostDetail/Title';
import Total from '@/components/PostDetail/Total';
import UserInfo from '@/components/PostDetail/UserInfo';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import KeyboardStickyLayout from '@/components/ui/layout/KeyboardStickyLayout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { useDeletePost } from '@/hooks/mutation/post/useDeletePost';
import useComments from '@/hooks/query/comment/useComments';
import { usePostDetail } from '@/hooks/query/post/usePostDetail';
import useLoading from '@/hooks/shared/useLoading';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { goBack } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { PostDetailRouteProp, RootStackNavigation } from '@/types/navigation';
import { CommunityType, MarketType } from '@/types/post';
import { navigateToEditPost } from '@/utilities/navigationHelpers';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

const PostDetail = () => {
	const { isBoardPost, isCommunityPost } = usePostContext();

	const stackNavigation = useNavigation<RootStackNavigation>();
	const userInfo = useAuthStore((state) => state.userInfo);
	const route = useRoute<PostDetailRouteProp>();
	const { id = '', collectionName = '' } = route.params;

	const scrollableContentRef = useRef<any>(null);
	const [shouldScroll, setShouldScroll] = useState(false);

	const { data: post, isLoading: isPostFetching } = usePostDetail(
		collectionName,
		id,
	);
	const { data: comments = [], isLoading: isCommentsFetching } = useComments(
		collectionName,
		id,
	);
	const { mutate: deletePost, isPending: isDeleting } = useDeletePost(
		collectionName,
		id,
	);

	const { isLoading: isCommentUploading, setIsLoading: setIsCommentUploading } =
		useLoading();

	useEffect(() => {
		if (post?.creatorId === userInfo?.uid) {
			stackNavigation.setOptions({
				headerRight: () => (
					<ActionSheetButton
						color={Colors.font_black}
						size={18}
						options={[
							{
								label: '수정',
								onPress: () => navigateToEditPost({ postId: id }),
							},
							{
								label: '삭제',
								onPress: handleDeletePost,
							},
							{ label: '취소', onPress: () => {} },
						]}
					/>
				),
			});
		}
	}, [post?.creatorId, userInfo?.uid, id, stackNavigation]);

	const handleDeletePost = async () => {
		Alert.alert('게시글 삭제', '정말로 삭제하겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				onPress: async () => await onConfirmDeletePost(),
			},
		]);
	};

	const onConfirmDeletePost = async () => {
		deletePost(undefined, {
			onSuccess: () => {
				showToast('success', '게시글이 삭제되었습니다.');
				goBack();
			},
			onError: (e) => {
				showToast('error', '게시글 삭제 중 오류가 발생했습니다.');
			},
		});
	};

	const scrollToBottom = () => {
		if (shouldScroll) {
			scrollableContentRef.current?.scrollToEnd({ animated: true });
			setShouldScroll(false);
		}
	};

	if (
		isPostFetching ||
		isCommentsFetching ||
		isDeleting ||
		isCommentUploading
	) {
		return <LoadingIndicator />;
	}

	if (!post || !collectionName) {
		return <EmptyIndicator message='게시글을 찾을 수 없습니다.' />;
	}

	return (
		<KeyboardStickyLayout
			scrollableContentRef={scrollableContentRef}
			containerStyle={styles.container}
			scrollableContent={
				<View style={styles.content}>
					{/* 헤더 */}
					<View style={styles.header}>
						<View style={[styles.typeAndMenuRow, { marginBottom: 8 }]}>
							{isBoardPost(post, collectionName) && (
								<MarketTypeBadge type={post.type as MarketType} />
							)}

							{isCommunityPost(post, collectionName) && (
								<CommunityTypeBadge type={post.type as CommunityType} />
							)}
						</View>

						<Title title={post.title} containerStyle={{ marginBottom: 4 }} />

						<View style={styles.infoContainer}>
							<UserInfo
								userId={post.creatorId}
								displayName={post.creatorDisplayName}
								islandName={post.creatorIslandName}
							/>
							<CreatedAt createdAt={post.createdAt} />
						</View>
					</View>

					{/* 본문 */}
					<View style={styles.body}>
						{isCommunityPost(post, collectionName) && (
							<ImageCarousel
								images={post.images}
								containerStyle={{ marginBottom: 16 }}
							/>
						)}
						<Body body={post.body} containerStyle={{ marginBottom: 24 }} />

						{isBoardPost(post, collectionName) && (
							<>
								<ItemSummaryList
									cart={post.cart}
									containerStyle={{ marginBottom: 16 }}
								/>
								<Total cart={post.cart} containerStyle={{ marginBottom: 24 }} />
							</>
						)}
					</View>

					{/* 댓글 */}
					<CommentsList
						postId={post.id}
						postCreatorId={post.creatorId}
						comments={comments}
						scrollToBottom={scrollToBottom}
					/>
				</View>
			}
			bottomContent={
				<CommentInput
					postId={post.id}
					setIsCommentUploading={setIsCommentUploading}
					setShouldScroll={setShouldScroll}
				/>
			}
		/>
	);
};

export default PostDetail;

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
	},
	content: {
		padding: 24,
	},
	typeAndMenuRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	header: {
		borderBottomWidth: 1,
		borderColor: Colors.border_gray,
		paddingBottom: 16,
		marginBottom: 16,
	},
	body: {
		borderBottomWidth: 1,
		borderColor: Colors.border_gray,
		marginBottom: 16,
	},
	infoContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
});

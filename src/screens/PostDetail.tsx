import CommunityTypeBadge from '@/components/Community/CommunityTypeBadge';
import MarketTypeBadge from '@/components/Home/MarketTypeBadge';
import Body from '@/components/PostDetail/Body';
import CommentInput, { CommentInputRef } from '@/components/PostDetail/CommentInput';
import CommentsList from '@/components/PostDetail/CommentsList';
import CreatedAt from '@/components/PostDetail/CreatedAt';
import ImageCarousel from '@/components/PostDetail/ImageCarousel';
import ItemSummaryList from '@/components/PostDetail/ItemSummaryList';
import ReportModal from '@/components/PostDetail/ReportModal';
import Title from '@/components/PostDetail/Title';
import Total from '@/components/PostDetail/Total';
import UserInfo from '@/components/PostDetail/UserInfo';
import ActionSheetButton from '@/components/ui/ActionSheetButton';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { Colors } from '@/constants/Color';
import { usePost } from '@/hooks/post/usePost';
import { usePostComment } from '@/hooks/post/usePostComment';
import { usePostReply } from '@/hooks/reply/usePostReply';
import { useBlockUser } from '@/hooks/shared/useBlockUser';
import { useReportUser } from '@/hooks/shared/useReportUser';
import { useUserInfo } from '@/stores/auth';
import { PostDetailRouteProp } from '@/types/navigation';
import { Collection, CommunityType, MarketType } from '@/types/post';
import { navigateToEditPost } from '@/utilities/navigationHelpers';
import { isBoardPost, isCommunityPost } from '@/utilities/typeGuards/postTypeGuards';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EditCommentModal from '@/components/PostDetail/EditCommentModal';

const PostDetail = () => {
	const headerHeight = useHeaderHeight();
	const insets = useSafeAreaInsets();
	const keyboardVerticalOffset = headerHeight + insets.top + insets.bottom + 10;

	const userInfo = useUserInfo();
	const route = useRoute<PostDetailRouteProp>();
	const { id = '', collectionName = '', notificationId = '' } = route.params;

	const flatListRef = useRef<any>(null);
	const commentInputRef = useRef<CommentInputRef>(null);
	const [shouldScroll, setShouldScroll] = useState<boolean>(false);

	// 게시글
	const { post, deletePost, closePost, isPostLoading } = usePost(
		collectionName as Collection,
		id,
		notificationId,
	);

	// 댓글
	const {
		comments,
		createComment,
		updateComment,
		isEditCommentModalVisible,
		editingCommentText,
		openEditCommentModal,
		closeEditCommentModal,
		isCommentsLoading,
	} = usePostComment(collectionName as Collection, id, setShouldScroll);

	// 답글
	const {
		isReplyMode,
		parentDisplayName,
		handleReplyClick: originalHandleReplyClick,
		handleReplyCancel,
		createReply,
		updateReply,
		isEditReplyModalVisible,
		editingReplyText,
		openEditReplyModal,
		closeEditReplyModal,
		isRepliesLoading,
	} = usePostReply(collectionName as Collection, id);

	const handleReplyClickWithFocus = (params: any) => {
		originalHandleReplyClick(params);
		setTimeout(() => {
			commentInputRef.current?.focus();
		}, 100);
	};

	// 신고
	const { isReportModalVisible, openReportModal, closeReportModal, submitReport } = useReportUser();

	// 차단
	const { isBlockedByMe, toggleBlock: onToggleBlock } = useBlockUser({
		targetUserId: post?.creatorId,
		targetUserDisplayName: post?.creatorDisplayName,
	});

	const handleDeletePost = async () => {
		Alert.alert('게시글 삭제', '정말로 삭제하겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				onPress: async () => await deletePost(),
			},
		]);
	};

	const isAuthor = post?.creatorId === userInfo?.uid;
	const showDoneOption = collectionName === 'Boards' && post?.type !== 'done';

	const headerOptions = [
		...(isAuthor
			? [
					showDoneOption && {
						label: '거래완료',
						onPress: closePost,
					},
					{
						label: '수정',
						onPress: () => navigateToEditPost({ postId: id }),
					},
					{
						label: '삭제',
						onPress: handleDeletePost,
					},
					{ label: '취소', onPress: () => {} },
			  ]
			: [
					{
						label: isBlockedByMe ? '차단 해제' : '차단',
						onPress: onToggleBlock,
					},
					{
						label: '신고',
						onPress: () => {
							openReportModal({
								postId: id,
								reporteeId: post!.creatorId,
							});
						},
					},
					{ label: '취소', onPress: () => {} },
			  ]),
	].filter(Boolean) as { label: string; onPress: () => void }[];

	const scrollToBottom = () => {
		if (shouldScroll) {
			flatListRef.current?.scrollToEnd({ animated: false });
			setShouldScroll(false);
		}
	};

	if (isPostLoading || isCommentsLoading || isRepliesLoading) {
		return <LoadingIndicator />;
	}

	if (!post || !collectionName) {
		return <EmptyIndicator message='게시글을 찾을 수 없습니다.' />;
	}

	return (
		<>
			<SafeAreaView style={styles.screen} edges={['bottom']}>
				<LayoutWithHeader
					headerRightComponent={
						userInfo ? (
							<ActionSheetButton
								color={Colors.font_black}
								size={18}
								destructiveButtonIndex={isAuthor ? (showDoneOption ? 2 : 1) : undefined}
								options={headerOptions}
							/>
						) : null
					}
				>
					<KeyboardAwareFlatList
						ref={flatListRef}
						data={[]}
						renderItem={null}
						keyboardShouldPersistTaps='handled'
						contentContainerStyle={{ flexGrow: 1 }}
						onContentSizeChange={scrollToBottom}
						enableAutomaticScroll={false}
						ListHeaderComponent={
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
										<ImageCarousel images={post.images} containerStyle={{ marginBottom: 16 }} />
									)}
									<Body body={post.body} containerStyle={{ marginBottom: 24 }} />

									{isBoardPost(post, collectionName) && (
										<>
											<ItemSummaryList cart={post.cart} containerStyle={{ marginBottom: 16 }} />
											<Total cart={post.cart} containerStyle={{ marginBottom: 24 }} />
										</>
									)}
								</View>

								{/* 댓글 */}
								<CommentsList
									postId={post.id}
									postCreatorId={post.creatorId}
									postCommentCount={post.commentCount}
									comments={comments}
									chatRoomIds={isBoardPost(post, collectionName) ? post.chatRoomIds : []}
									collectionName={collectionName as Collection}
									onReportClick={({ commentId, reporteeId }) =>
										openReportModal({
											postId: post.id,
											commentId,
											reporteeId,
										})
									}
									onEditCommentClick={({ commentId, commentText }) =>
										openEditCommentModal({ commentId, commentText })
									}
									onReplyClick={handleReplyClickWithFocus}
									onEditReplyClick={({ replyId, commentId, replyText }) =>
										openEditReplyModal({ replyId, commentId, replyText })
									}
								/>
							</View>
						}
					/>
					<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
						keyboardVerticalOffset={keyboardVerticalOffset}
					>
						<CommentInput
							ref={commentInputRef}
							onSubmit={isReplyMode ? createReply : createComment}
							disabled={!userInfo}
							replyMode={
								isReplyMode
									? {
											isReplyMode: true,
											parentDisplayName: parentDisplayName!,
											onCancel: handleReplyCancel,
									  }
									: undefined
							}
						/>
					</KeyboardAvoidingView>

					{isEditCommentModalVisible && (
						<EditCommentModal
							comment={editingCommentText}
							isVisible={isEditCommentModalVisible}
							onClose={closeEditCommentModal}
							onSubmit={updateComment}
						/>
					)}

					{isEditReplyModalVisible && (
						<EditCommentModal
							comment={editingReplyText}
							isVisible={isEditReplyModalVisible}
							onClose={closeEditReplyModal}
							onSubmit={updateReply}
							title='답글 수정'
						/>
					)}

					{isReportModalVisible && (
						<ReportModal
							isVisible={isReportModalVisible}
							onClose={closeReportModal}
							onSubmit={submitReport}
						/>
					)}
				</LayoutWithHeader>
			</SafeAreaView>
		</>
	);
};

export default PostDetail;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	content: {
		padding: 24,
		paddingTop: 16,
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

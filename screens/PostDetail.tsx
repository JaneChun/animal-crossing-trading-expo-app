import CommunityTypeBadge from '@/components/Community/CommunityTypeBadge';
import MarketTypeBadge from '@/components/Home/MarketTypeBadge';
import Body from '@/components/PostDetail/Body';
import CommentInput from '@/components/PostDetail/CommentInput';
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
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import {
	handleBlockUser,
	handleUnblockUser,
} from '@/firebase/services/blockService';
import { createReport } from '@/firebase/services/reportService';
import { usePost } from '@/hooks/post/usePost';
import { usePostComment } from '@/hooks/post/usePostComment';
import { useAuthStore } from '@/stores/AuthStore';
import { useBlockStore } from '@/stores/BlockStore';
import { reportUserParams } from '@/types/components';
import { PostDetailRouteProp } from '@/types/navigation';
import { Collection, CommunityType, MarketType } from '@/types/post';
import { CreateReportRequest } from '@/types/report';
import {
	navigateToEditPost,
	navigateToLogin,
} from '@/utilities/navigationHelpers';
import {
	isBoardPost,
	isCommunityPost,
} from '@/utilities/typeGuards/postTypeGuards';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	View,
} from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import EditCommentModal from '../components/PostDetail/EditCommentModal';

const PostDetail = () => {
	const headerHeight = useHeaderHeight();
	const insets = useSafeAreaInsets();
	const keyboardVerticalOffset = headerHeight + insets.top + insets.bottom + 10;

	const userInfo = useAuthStore((state) => state.userInfo);
	const route = useRoute<PostDetailRouteProp>();
	const { id = '', collectionName = '', notificationId = '' } = route.params;

	const flatListRef = useRef<any>(null);
	const [shouldScroll, setShouldScroll] = useState<boolean>(false);

	const { post, deletePost, closePost, isPostLoading } = usePost(
		collectionName as Collection,
		id,
		notificationId,
	);
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

	// 차단
	const blockedUsers = useBlockStore((state) => state.blockedUsers);
	const isBlockedByMe = blockedUsers.some((uid) => uid === post?.creatorId);

	// 신고
	const [isReportModalVisible, setIsReportModalVisible] =
		useState<boolean>(false);

	const [reportTarget, setReportTarget] = useState<{
		postId: string;
		commentId?: string;
		reporteeId: string;
	} | null>(null);

	const openReportModal = (params: {
		postId: string;
		reporteeId: string;
		commentId?: string;
	}) => {
		setReportTarget(params);
		setIsReportModalVisible(true);
	};

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
			  ]
			: post
			? [
					{
						label: isBlockedByMe ? '차단 해제' : '차단',
						onPress: () =>
							isBlockedByMe
								? handleUnblockUser({
										userId: userInfo?.uid,
										blockUserId: post?.creatorId,
										blockUserDisplayName: post?.creatorDisplayName,
								  })
								: handleBlockUser({
										userId: userInfo?.uid,
										blockUserId: post?.creatorId,
										blockUserDisplayName: post?.creatorDisplayName,
								  }),
					},
					{
						label: '신고',
						onPress: () =>
							openReportModal({
								postId: id,
								reporteeId: post.creatorId,
							}),
					},
			  ]
			: []),
		{ label: '취소', onPress: () => {} },
	].filter(Boolean) as { label: string; onPress: () => void }[];

	const reportUser = async ({ category, detail = '' }: reportUserParams) => {
		if (!userInfo) {
			showToast('warn', '댓글 신고는 로그인 후 가능합니다.');
			navigateToLogin();
			return;
		}

		if (!reportTarget) {
			showToast('error', '신고 대상을 찾을 수 없습니다.');
			return;
		}

		try {
			const { postId, commentId, reporteeId } = reportTarget;

			if (reporteeId === userInfo.uid) return; // 자기 자신 신고 X

			const postReport: CreateReportRequest = {
				reporterId: userInfo.uid,
				reporteeId,
				postId,
				commentId,
				category,
				detail,
			};

			await createReport(postReport);

			showToast('success', '신고가 제출되었습니다.');
		} catch (e) {
			showToast('error', '신고 제출 중 오류가 발생했습니다.');
		} finally {
			setIsReportModalVisible(false);
			setReportTarget(null);
		}
	};

	const scrollToBottom = () => {
		if (shouldScroll) {
			flatListRef.current?.scrollToEnd({ animated: false });
			setShouldScroll(false);
		}
	};

	if (isPostLoading || isCommentsLoading) {
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
								destructiveButtonIndex={
									isAuthor ? (showDoneOption ? 2 : 1) : undefined
								}
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

									<Title
										title={post.title}
										containerStyle={{ marginBottom: 4 }}
									/>

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
									<Body
										body={post.body}
										containerStyle={{ marginBottom: 24 }}
									/>

									{isBoardPost(post, collectionName) && (
										<>
											<ItemSummaryList
												cart={post.cart}
												containerStyle={{ marginBottom: 16 }}
											/>
											<Total
												cart={post.cart}
												containerStyle={{ marginBottom: 24 }}
											/>
										</>
									)}
								</View>

								{/* 댓글 */}
								<CommentsList
									postId={post.id}
									postCreatorId={post.creatorId}
									comments={comments}
									chatRoomIds={
										isBoardPost(post, collectionName) ? post.chatRoomIds : []
									}
									onReportClick={({ commentId, reporteeId }) =>
										openReportModal({
											postId: post.id,
											commentId,
											reporteeId,
										})
									}
									onEditClick={({ commentId, commentText }) =>
										openEditCommentModal({ commentId, commentText })
									}
								/>
							</View>
						}
					/>
					<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
						keyboardVerticalOffset={keyboardVerticalOffset}
					>
						<CommentInput onSubmit={createComment} disabled={!userInfo} />
					</KeyboardAvoidingView>

					{isEditCommentModalVisible && (
						<EditCommentModal
							comment={editingCommentText}
							isVisible={isEditCommentModalVisible}
							onClose={closeEditCommentModal}
							onSubmit={updateComment}
						/>
					)}

					{isReportModalVisible && (
						<ReportModal
							isVisible={isReportModalVisible}
							onClose={() => setIsReportModalVisible(false)}
							onSubmit={reportUser}
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

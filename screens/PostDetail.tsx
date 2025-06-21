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
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { createReport } from '@/firebase/services/reportService';
import { sendReviewSystemMessage } from '@/firebase/services/reviewService';
import { useCreateComment } from '@/hooks/mutation/comment/useCreateComment';
import { useMarkAsRead } from '@/hooks/mutation/notification/useMarkAsRead';
import { useDeletePost } from '@/hooks/mutation/post/useDeletePost';
import { useUpdatePost } from '@/hooks/mutation/post/useUpdatePost';
import useComments from '@/hooks/query/comment/useComments';
import { usePostDetail } from '@/hooks/query/post/usePostDetail';
import { useKeyboardHeight } from '@/hooks/shared/useKeyboardHeight';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { goBack } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { CreateCommentRequest } from '@/types/comment';
import { PostDetailRouteProp, RootStackNavigation } from '@/types/navigation';
import { Collection, CommunityType, MarketType } from '@/types/post';
import { CreateReportRequest, ReportCategory } from '@/types/report';
import { navigateToEditPost } from '@/utilities/navigationHelpers';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, StyleSheet, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PostDetail = () => {
	const insets = useSafeAreaInsets();
	const keyboardHeight = useKeyboardHeight();

	const { isBoardPost, isCommunityPost } = usePostContext();

	const stackNavigation = useNavigation<RootStackNavigation>();
	const userInfo = useAuthStore((state) => state.userInfo);
	const route = useRoute<PostDetailRouteProp>();
	const { id = '', collectionName = '', notificationId = '' } = route.params;

	const flatListRef = useRef<any>(null);
	const [shouldScroll, setShouldScroll] = useState<boolean>(false);

	const [isReportModalVisible, setIsReportModalVisible] =
		useState<boolean>(false);
	const [reportTarget, setReportTarget] = useState<{
		postId: string;
		commentId?: string;
		reporteeId: string;
	} | null>(null);

	const { data: post, isLoading: isPostFetching } = usePostDetail(
		collectionName as Collection,
		id,
	);
	const { data: comments = [], isLoading: isCommentsFetching } = useComments(
		collectionName as Collection,
		id,
	);
	const { mutate: deletePost, isPending: isDeleting } = useDeletePost(
		collectionName as Collection,
		id,
	);
	const { mutate: markAsRead } = useMarkAsRead();
	const { mutate: createComment, isPending: isCommentCreating } =
		useCreateComment({
			collectionName: collectionName as Collection,
			postId: id,
		});

	const openReportModal = (params: {
		postId: string;
		reporteeId: string;
		commentId?: string;
	}) => {
		setReportTarget(params);
		setIsReportModalVisible(true);
	};

	// 헤더에 글 수정/삭제 아이콘 설정
	useEffect(() => {
		if (!post || !collectionName) return;

		const isAuthor = post.creatorId === userInfo?.uid;
		const showDoneOption = collectionName === 'Boards' && post?.type !== 'done';

		const options = [
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
				: [
						{
							label: '신고',
							onPress: () =>
								openReportModal({
									postId: id,
									reporteeId: post.creatorId,
								}),
						},
				  ]),
			{ label: '취소', onPress: () => {} },
		].filter(Boolean) as { label: string; onPress: () => void }[];

		stackNavigation.setOptions({
			headerRight: () =>
				userInfo ? (
					<ActionSheetButton
						color={Colors.font_black}
						size={18}
						destructiveButtonIndex={
							isAuthor ? (showDoneOption ? 2 : 1) : undefined
						}
						options={options}
					/>
				) : null,
		});
	}, [post, collectionName, userInfo?.uid, id, stackNavigation]);

	// 알림 읽음 처리
	useEffect(() => {
		if (notificationId) {
			markAsRead(notificationId);
		}
	}, [notificationId]);

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

	const closePost = async () => {
		if (!post || !collectionName || !isBoardPost(post, collectionName)) return;

		const { mutate: updatePost } = useUpdatePost('Boards', post.id);

		if (!post.reviewPromptSent) {
			await sendReviewSystemMessage({
				postId: post.id,
				chatRoomIds: post.chatRoomIds,
			});
		}

		updatePost({
			type: 'done',
			reviewPromptSent: true,
		});
	};

	const onSubmitComment = async (commentInput: string) => {
		if (!userInfo) return;

		const requestData: CreateCommentRequest = {
			body: commentInput,
		};

		createComment(
			{ requestData, userId: userInfo.uid },
			{
				onSuccess: async (id) => {
					setShouldScroll(true);
					showToast('success', '댓글이 등록되었습니다.');
					Keyboard.dismiss();
				},
				onError: (e) => {
					showToast('error', '댓글 등록 중 오류가 발생했습니다.');
				},
			},
		);
	};

	const reportUser = async ({
		category,
		detail = '',
	}: {
		category: ReportCategory;
		detail?: string;
	}) => {
		try {
			if (!reportTarget || !userInfo) return;
			const { postId, commentId, reporteeId } = reportTarget;

			if (reporteeId === userInfo.uid) return;

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
			// flatListRef.current?.scrollToPosition(0, 9999);
			flatListRef.current?.scrollToEnd({ animated: false });
			setShouldScroll(false);
		}
	};

	if (isPostFetching || isCommentsFetching || isDeleting || isCommentCreating) {
		return <LoadingIndicator />;
	}

	if (!post || !collectionName) {
		return <EmptyIndicator message='게시글을 찾을 수 없습니다.' />;
	}

	return (
		<View
			style={[styles.screen, { paddingBottom: keyboardHeight + insets.bottom }]}
		>
			<KeyboardAwareFlatList
				ref={flatListRef}
				data={[]}
				renderItem={null}
				keyboardShouldPersistTaps='handled'
				contentContainerStyle={{ flexGrow: 1 }}
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
							scrollToBottom={scrollToBottom}
							openReportModal={({ commentId, reporteeId }) =>
								openReportModal({
									postId: post.id,
									commentId,
									reporteeId,
								})
							}
						/>
					</View>
				}
			/>

			<CommentInput onSubmit={onSubmitComment} disabled={!userInfo} />

			{isReportModalVisible && (
				<ReportModal
					isVisible={isReportModalVisible}
					onClose={() => setIsReportModalVisible(false)}
					onSubmit={({ category, detail }) => reportUser({ category, detail })}
				/>
			)}
		</View>
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

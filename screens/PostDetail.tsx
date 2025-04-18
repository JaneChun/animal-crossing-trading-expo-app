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
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { useDeletePost } from '@/hooks/mutation/post/useDeletePost';
import useComments from '@/hooks/query/comment/useComments';
import { usePostDetail } from '@/hooks/query/post/usePostDetail';
import useLoading from '@/hooks/shared/useLoading';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { goBack } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { PostDetailRouteProp } from '@/types/navigation';
import { CommunityType, MarketType } from '@/types/post';
import { navigateToEditPost } from '@/utilities/navigationHelpers';
import { useRoute } from '@react-navigation/native';
import React from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const PostDetail = () => {
	const { isBoardPost, isCommunityPost } = usePostContext();

	const userInfo = useAuthStore((state) => state.userInfo);
	const route = useRoute<PostDetailRouteProp>();
	const { id = '', collectionName = '' } = route.params;

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

	if (
		isPostFetching ||
		isCommentsFetching ||
		isDeleting ||
		isCommentUploading
	) {
		return <LoadingIndicator />;
	}

	if (!post) {
		return (
			<View style={styles.invalidPostContainer}>
				<Text style={styles.invalidPostText}>게시글을 찾을 수 없습니다.</Text>
			</View>
		);
	}

	return (
		<View style={styles.screen}>
			<KeyboardAvoidingView style={styles.container} behavior='padding'>
				<FlatList
					data={[]}
					renderItem={null}
					keyboardShouldPersistTaps='handled'
					ListEmptyComponent={
						<View style={styles.content}>
							{/* 헤더 */}
							<View style={styles.header}>
								<View style={styles.typeAndMenuRow}>
									{isBoardPost(post, collectionName) && (
										<MarketTypeBadge
											type={post.type as MarketType}
											containerStyle={styles.typeBadgeContainer}
										/>
									)}

									{isCommunityPost(post, collectionName) && (
										<CommunityTypeBadge
											type={post.type as CommunityType}
											containerStyle={styles.typeBadgeContainer}
										/>
									)}

									{post.creatorId === userInfo?.uid && (
										<ActionSheetButton
											color={Colors.font_gray}
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
									)}
								</View>

								<Title
									title={post.title}
									containerStyle={{ marginBottom: 8 }}
								/>
								<UserInfo
									userId={post.creatorId}
									displayName={post.creatorDisplayName}
									islandName={post.creatorIslandName}
									containerStyle={{ marginBottom: 8 }}
								/>
								<CreatedAt
									createdAt={post.createdAt}
									containerStyle={{ marginBottom: 16 }}
								/>
							</View>

							{/* 본문 */}
							<View style={styles.body}>
								{isCommunityPost(post, collectionName) && (
									<ImageCarousel
										images={post.images}
										containerStyle={{ marginBottom: 16 }}
									/>
								)}
								<Body body={post.body} containerStyle={{ marginBottom: 36 }} />

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
								containerStyle={{ marginBottom: 60 }}
							/>
						</View>
					}
				/>
				<CommentInput
					postId={post.id}
					setIsCommentUploading={setIsCommentUploading}
				/>
			</KeyboardAvoidingView>
		</View>
	);
};

export default PostDetail;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
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
		marginBottom: 16,
	},
	body: {
		borderBottomWidth: 1,
		borderColor: Colors.border_gray,
		marginBottom: 16,
	},
	typeBadgeContainer: {
		flexDirection: 'row',
		marginLeft: -2,
		marginBottom: 12,
	},
	invalidPostContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	invalidPostText: {
		color: Colors.font_gray,
		alignSelf: 'center',
	},
});

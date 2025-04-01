import CommunityTypeBadge from '@/components/Community/TypeBadge';
import MarketTypeBadge from '@/components/Home/TypeBadge';
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
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import useGetComments from '@/hooks/useGetComments';
import useLoading from '@/hooks/useLoading';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { useRefreshStore } from '@/stores/RefreshStore';
import { PostDetailRouteProp } from '@/types/navigation';
import {
	useFocusEffect,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import useGetPostDetail from '../hooks/useGetPostDetail';

const PostDetail = () => {
	const route = useRoute<PostDetailRouteProp>();
	const { id = '' } = route.params;
	const userInfo = useAuthStore((state) => state.userInfo);
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const isMarket = activeTab === 'Home' || activeTab === 'Profile';
	const isCommunity = activeTab === 'Community';
	const collectionName = isMarket ? 'Boards' : 'Communities';
	const stackNavigation = useNavigation<any>();
	const {
		post,
		isLoading: isPostFetching,
		refresh: postRefresh,
	} = useGetPostDetail(collectionName, id);
	const {
		comments,
		isLoading: isCommentsFetching,
		refresh: commentRefresh,
	} = useGetComments(collectionName, id);
	const {
		isLoading: isCommentUploading,
		setIsLoading: setIsCommentUploading,
		LoadingIndicator,
	} = useLoading();
	const { shouldRefreshPostDetail, setRefreshPostDetail } = useRefreshStore(
		(state) => state,
	);

	useFocusEffect(
		useCallback(() => {
			if (shouldRefreshPostDetail) {
				postRefresh();
				commentRefresh();
				setRefreshPostDetail(false);
			}
		}, [postRefresh, commentRefresh, shouldRefreshPostDetail]),
	);

	const editPost = (id: string) => {
		stackNavigation.navigate('NewPost', { id });
	};

	const deletePost = async (id: string) => {
		Alert.alert('게시글 삭제', '정말로 삭제하겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				onPress: async () => await handleDeletePost({ postId: id }),
			},
		]);
	};

	const handleDeletePost = async ({ postId }: { postId: string }) => {
		try {
			await deletePostFromDB(postId);
			showToast('success', '게시글이 삭제되었습니다.');
			stackNavigation.goBack();
		} catch (e) {
			showToast('error', '게시글 삭제 중 오류가 발생했습니다.');
		}
	};

	if (isPostFetching || isCommentUploading || isCommentsFetching) {
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
								<View style={styles.row}>
									{isMarket && (
										<MarketTypeBadge
											type={post.type}
											containerStyle={styles.typeBadgeContainer}
										/>
									)}
									{isCommunity && (
										<CommunityTypeBadge
											type={post.type}
											containerStyle={styles.typeBadgeContainer}
										/>
									)}
									{post.creatorId === userInfo?.uid && (
										<ActionSheetButton
											color={Colors.font_gray}
											size={18}
											options={[
												{ label: '수정', onPress: () => editPost(id) },
												{ label: '삭제', onPress: () => deletePost(id) },
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
								{isCommunity && (
									<ImageCarousel
										images={post.images}
										containerStyle={{ marginBottom: 16 }}
									/>
								)}
								<Body body={post.body} containerStyle={{ marginBottom: 36 }} />

								{isMarket && (
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
								commentRefresh={commentRefresh}
							/>
						</View>
					}
				/>
				<CommentInput
					postId={post.id}
					setIsLoading={setIsCommentUploading}
					commentRefresh={commentRefresh}
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
	header: {
		borderBottomWidth: 1,
		borderColor: Colors.border_gray,
		marginBottom: 16,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
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
function deletePostFromDB(postId: string) {
	throw new Error('Function not implemented.');
}

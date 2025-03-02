import TypeBadge from '@/components/Home/TypeBadge';
import ActionButtons from '@/components/PostDetail/ActionButtons';
import Body from '@/components/PostDetail/Body';
import CommentInput from '@/components/PostDetail/CommentInput';
import CommentsList from '@/components/PostDetail/CommentsList';
import CreatedAt from '@/components/PostDetail/CreatedAt';
import ImageCarousel from '@/components/PostDetail/ImageCarousel';
import ItemSummaryList from '@/components/PostDetail/ItemSummaryList';
import Title from '@/components/PostDetail/Title';
import Total from '@/components/PostDetail/Total';
import UserInfo from '@/components/PostDetail/UserInfo';
import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import useGetComments from '@/hooks/useGetComments';
import useLoading from '@/hooks/useLoading';
import { PostDetailRouteProp } from '@/types/navigation';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import useGetPostDetail from '../hooks/useGetPostDetail';

const PostDetail = () => {
	const route = useRoute<PostDetailRouteProp>();
	const { id = '' } = route.params;
	const { userInfo } = useAuthContext();
	const {
		post,
		isLoading: isPostFetching,
		refresh: postRefresh,
	} = useGetPostDetail(id);
	const {
		comments,
		isLoading: isCommentsFetching,
		refresh: commentRefresh,
	} = useGetComments(id);
	const {
		isLoading: isCommentUploading,
		setIsLoading: setIsCommentUploading,
		LoadingIndicator,
	} = useLoading();

	useFocusEffect(
		useCallback(() => {
			postRefresh();
			commentRefresh();
		}, [postRefresh, commentRefresh]),
	);

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
								{post.creatorId === userInfo?.uid && (
									<ActionButtons id={post.id} />
								)}
								<TypeBadge
									type={post.type}
									containerStyle={styles.typeBadgeContainer}
								/>
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
								<ImageCarousel
									images={post.images}
									containerStyle={{ marginBottom: 16 }}
								/>
								<Body body={post.body} containerStyle={{ marginBottom: 36 }} />
								<ItemSummaryList
									cart={post.cart}
									containerStyle={{ marginBottom: 16 }}
								/>
								<Total cart={post.cart} containerStyle={{ marginBottom: 24 }} />
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

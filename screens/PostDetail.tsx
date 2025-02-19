import { PostDetailRouteProp } from '@/types/navigation';
import React, { useCallback } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import useGetPostDetail from '../hooks/useGetPostDetail';
import CommentsList from '@/components/PostDetail/CommentsList';
import { Colors } from '@/constants/Color';
import TypeBadge from '@/components/Home/TypeBadge';
import UserInfo from '@/components/PostDetail/UserInfo';
import ImageCarousel from '@/components/PostDetail/ImageCarousel';
import ItemSummaryList from '@/components/PostDetail/ItemSummaryList';
import Title from '@/components/PostDetail/Title';
import CreatedAt from '@/components/PostDetail/CreatedAt';
import Body from '@/components/PostDetail/Body';
import Total from '@/components/PostDetail/Total';
import ActionButtons from '@/components/PostDetail/ActionButtons';
import { useAuthContext } from '@/contexts/AuthContext';
import { FlatList } from 'react-native-gesture-handler';
import useLoading from '@/hooks/useLoading';
import CommentInput from '@/components/PostDetail/CommentInput';
import useGetComments from '@/hooks/useGetComments';

const PostDetail = () => {
	const route = useRoute<PostDetailRouteProp>();
	const { id = '' } = route?.params ?? {};
	const { userInfo } = useAuthContext();
	const {
		post,
		error,
		isLoading: loading,
		refresh: postRefresh,
	} = useGetPostDetail(id);
	const {
		isLoading: isCommentUploadLoading,
		setIsLoading,
		LoadingIndicator,
	} = useLoading();
	const {
		comments,
		commentsError,
		isCommentsLoading,
		refresh: commentRefresh,
	} = useGetComments(id);

	// if (error) console.log(error);
	// if (commentsError) console.log(commentsError);

	useFocusEffect(
		useCallback(() => {
			console.log('refresh');
			postRefresh();
			commentRefresh();
		}, []),
	);

	if (loading || isCommentUploadLoading || isCommentsLoading) {
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
		<KeyboardAvoidingView style={styles.screen} behavior='padding'>
			<View style={styles.screen}>
				<FlatList
					data={[]}
					renderItem={null}
					style={styles.container}
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps='handled'
					ListEmptyComponent={
						<View style={styles.content}>
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
						</View>
					}
					ListFooterComponent={
						<CommentsList
							postId={post.id}
							postCreatorId={post.creatorId}
							comments={comments}
							containerStyle={{ marginBottom: 60 }}
						/>
					}
				/>
				{/* 키보드 위에 고정되는 입력창 */}
				<CommentInput
					postId={post.id}
					setIsLoading={setIsLoading}
					commentRefresh={commentRefresh}
				/>
			</View>
		</KeyboardAvoidingView>
	);
};

export default PostDetail;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	container: {
		backgroundColor: 'white',
		padding: 24,
		paddingBottom: 0,
	},
	content: {
		paddingHorizontal: 2,
		flex: 1,
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
	},
	invalidPostText: {
		color: Colors.font_gray,
		alignSelf: 'center',
	},
});

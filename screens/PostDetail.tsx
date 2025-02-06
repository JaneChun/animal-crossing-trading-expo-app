import { PostDetailRouteProp } from '@/types/navigation';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import useGetPostDetail from '../hooks/useGetPostDetail';
// import Comment from '../Components/PostDetail/Comment';
// import useGetComment from '../Hooks/useGetComment';
// import spinner from '../Images/loading.jpg';
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

const PostDetail = () => {
	const route = useRoute<PostDetailRouteProp>();
	const { id = '' } = route?.params ?? {};
	const { userInfo } = useAuthContext();
	const [isUpdated, setIsUpdated] = useState(false);
	const { post, error, loading } = useGetPostDetail(id, isUpdated);

	// const [isCommentsUpdated, setIsCommentsUpdated] = useState(false);
	// const { comments, commentsError, commentsLoading } = useGetComment(
	// 	id,
	// 	isCommentsUpdated,
	// );

	// if (error) console.log(error);
	// if (commentsError) console.log(commentsError);

	useFocusEffect(
		useCallback(() => {
			setIsUpdated((prev) => !prev);
		}, [id]),
	);

	const totalPrice =
		post?.cart?.reduce(
			(acc: number, cur: { quantity: number; price: number }) =>
				acc + Number(cur.quantity) * Number(cur.price),
			0,
		) ?? 0;

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				{/* <Image source={spinner} style={{ height: 80, width: 80 }} /> */}
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	if (!post) {
		return (
			<View style={styles.invalidPostContainer}>
				<Text style={styles.invalidPostText}>게시글을 찾을 수 없습니다.</Text>
			</View>
		);
	}

	return (
		<FlatList
			data={[]}
			renderItem={null}
			style={styles.container}
			ListEmptyComponent={
				<View style={styles.content}>
					<View style={styles.header}>
						{post.creatorId === userInfo?.uid && <ActionButtons id={post.id} />}
						<TypeBadge
							type={post.type}
							containerStyle={styles.typeBadgeContainer}
						/>
						<Title title={post.title} containerStyle={{ marginBottom: 8 }} />
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
						<Body body={post.body} containerStyle={{ marginBottom: 32 }} />
						<ItemSummaryList
							cart={post.cart}
							containerStyle={{ marginBottom: 8 }}
						/>
						<Total
							totalPrice={totalPrice}
							containerStyle={{ marginBottom: 16 }}
						/>
					</View>

					{/* <Comment
							done={post.done}
							postCreatorId={post.creatorId}
							comments={comments}
							id={post.id}
							isCommentsUpdated={isCommentsUpdated}
							setIsCommentsUpdated={setIsCommentsUpdated}
					/> */}
				</View>
			}
		></FlatList>
	);
};

export default PostDetail;

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		padding: 24,
	},
	loadingContainer: {
		backgroundColor: 'white',
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		paddingHorizontal: 2,
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

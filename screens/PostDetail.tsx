import { PostDetailRouteProp, StackNavigation } from '@/types/navigation';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Image,
	ScrollView,
	Text,
	View,
	StyleSheet,
} from 'react-native';
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useNavigation, useRoute } from '@react-navigation/native';
// import Comment from '../Components/PostDetail/Comment';
import { useAuthContext } from '../contexts/AuthContext';
import { updateDataToFirestore } from '../utilities/firebaseApi';
// import useGetComment from '../Hooks/useGetComment';
import useGetPostDetail from '../hooks/useGetPostDetail';
import { db, storage } from '../fbase';
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

const PostDetail = () => {
	const navigation = useNavigation<StackNavigation>();
	const route = useRoute<PostDetailRouteProp>();
	const { id } = route.params;
	// const { userInfo } = useAuthContext();
	const [isUpdated, setIsUpdated] = useState(false);
	const { post, error, loading } = useGetPostDetail(id, isUpdated);

	console.log(post);
	// const [isCommentsUpdated, setIsCommentsUpdated] = useState(false);
	// const { comments, commentsError, commentsLoading } = useGetComment(
	// 	id,
	// 	isCommentsUpdated,
	// );

	// if (error) console.log(error);
	// if (commentsError) console.log(commentsError);

	// const editPost = () => {
	// 	if (post.done) return;
	// 	navigation.navigate('PostEdit', { id });
	// };

	// const deletePost = async () => {
	// 	Alert.alert('삭제 확인', '정말로 삭제하겠습니까?', [
	// 		{ text: '취소', style: 'cancel' },
	// 		{
	// 			text: '삭제',
	// 			onPress: async () => {
	// 				const docRef = doc(db, 'Boards', post.id);
	// 				try {
	// 					await deleteDoc(docRef);
	// 					if (post.photoURL) {
	// 						const desertRef = ref(storage, `BoardImages/${post.id}`);
	// 						await deleteObject(desertRef);
	// 					}
	// 					navigation.navigate('Post');
	// 				} catch (error) {
	// 					console.log(error);
	// 				}
	// 			},
	// 		},
	// 	]);
	// };

	// const closePost = async () => {
	// 	if (!userInfo || !id || post.done) return;
	// 	Alert.alert('거래 완료', '거래 완료로 변경하겠습니까?', [
	// 		{ text: '취소', style: 'cancel' },
	// 		{
	// 			text: '확인',
	// 			onPress: async () => {
	// 				try {
	// 					const docRef = doc(db, 'Boards', id);
	// 					await updateDataToFirestore(docRef, { done: true });
	// 					setIsUpdated(!isUpdated);
	// 				} catch (error) {
	// 					console.log(error);
	// 				}
	// 			},
	// 		},
	// 	]);
	// };
	const totalPrice = post.cart?.reduce(
		(acc: number, cur: { quantity: number; price: number }) =>
			acc + Number(cur.quantity) * Number(cur.price),
		0,
	);

	return (
		<ScrollView style={styles.container}>
			{/* {loading || commentsLoading ? ( */}
			{loading ? (
				<View style={styles.loadingContainer}>
					{/* <Image source={spinner} style={{ height: 80, width: 80 }} /> */}
					<ActivityIndicator size='large' color={Colors.primary} />
				</View>
			) : (
				<View style={styles.content}>
					<View style={styles.header}>
						{/* 수정, 삭제, 거래 완료 버튼 */}
						{/* {post.creatorId === userInfo?.uid && (
						<View style={styles.actionsContainer}>
							{!post.done && (
								<TouchableOpacity onPress={editPost}>
									<Text style={styles.editButton}>수정</Text>
								</TouchableOpacity>
							)}
							<TouchableOpacity onPress={deletePost}>
								<Text style={styles.deleteButton}>삭제</Text>
							</TouchableOpacity>
							{!post.done && (
								<TouchableOpacity onPress={closePost}>
									<Text style={styles.completeButton}>거래 완료</Text>
								</TouchableOpacity>
							)}
						</View>
					)} */}

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
						{/* 사진 */}
						<ImageCarousel
							images={post.images}
							containerStyle={{ marginBottom: 16 }}
						/>

						{/* 본문 */}
						<Body body={post.body} containerStyle={{ marginBottom: 32 }} />

						{/* 아이템 목록 */}
						<ItemSummaryList
							cart={post.cart}
							containerStyle={{ marginBottom: 8 }}
						/>

						{/* 총계 */}
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
			)}
		</ScrollView>
	);
};

export default PostDetail;

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		padding: 24,
	},
	loadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
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
	// actionsContainer: {
	// 	flexDirection: 'row',
	// 	justifyContent: 'space-between',
	// 	marginVertical: 10,
	// },
	// editButton: {
	// 	color: 'blue',
	// 	fontSize: 16,
	// },
	// deleteButton: {
	// 	color: 'red',
	// 	fontSize: 16,
	// },
	// completeButton: {
	// 	color: 'green',
	// 	fontSize: 16,
	// },
});

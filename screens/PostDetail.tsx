import { PostDetailRouteProp, StackNavigation } from '@/types/navigation';
import React, { useContext, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
	StyleSheet,
	FlatList,
	Dimensions,
} from 'react-native';
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useNavigation, useRoute } from '@react-navigation/native';
// import Comment from '../Components/PostDetail/Comment';
import { useAuthContext } from '../contexts/AuthContext';
import { elapsedTime } from '../utilities/elapsedTime';
import { updateDataToFirestore } from '../utilities/firebaseApi';
// import useGetComment from '../Hooks/useGetComment';
import useGetPostDetail from '../hooks/useGetPostDetail';
import { db, storage } from '../fbase';
// import spinner from '../Images/loading.jpg';
import { Colors } from '@/constants/Color';
import TypeBadge from '@/components/Home/TypeBadge';
import { Ionicons } from '@expo/vector-icons';
import Carousel, {
	Pagination,
	PaginationProps,
} from 'react-native-snap-carousel';

const { width, height } = Dimensions.get('window');

const PostDetail = () => {
	const navigation = useNavigation<StackNavigation>();
	const route = useRoute<PostDetailRouteProp>();
	const { id } = route.params;
	// const { userInfo } = useAuthContext();
	const [isUpdated, setIsUpdated] = useState(false);
	const { post, error, loading } = useGetPostDetail(id, isUpdated);
	const [activeIndex, setActiveIndex] = React.useState(0);

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
						{/* 거래 타입 */}
						<View style={styles.typeBadgeContainer}>
							<TypeBadge type={post.type} />
						</View>

						{/* 타이틀 */}
						<Text style={styles.title}>{post.title}</Text>

						{/* 유저 정보 */}
						<View style={styles.userInfoContainer}>
							<Text style={styles.creatorDisplayName}>
								{post.creatorDisplayName}
							</Text>
							<View style={styles.creatorIslandInfo}>
								<Image
									source={{
										uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FCoconut_Tree_NH_Inv_Icon.png?alt=media&token=cd997010-694e-49b0-9390-483772cdad8a',
									}}
									style={styles.islandImage}
								/>
								<Text style={styles.islandName}>
									{post.creatorIslandName || '지지섬'}
								</Text>
							</View>
						</View>

						{/* 시간 */}
						<Text style={styles.date}>
							{elapsedTime(post.createdAt?.toDate())}
						</Text>

						{/* 사진 */}
						{post.images && (
							<>
								<Carousel
									data={post.images}
									renderItem={({ item }) => (
										<Image
											source={{ uri: item as string }}
											style={styles.carouselImage}
										/>
									)}
									sliderWidth={width}
									itemWidth={width * 0.8}
									onSnapToItem={(index) => setActiveIndex(index)}
									inactiveSlideScale={0.95}
									containerCustomStyle={{
										marginStart: -30,
									}}
								/>
								<Pagination
									dotsLength={post.images.length}
									activeDotIndex={activeIndex}
									containerStyle={{ paddingVertical: 10 }}
									dotStyle={{
										width: 8,
										height: 8,
										backgroundColor: Colors.primary,
									}}
									inactiveDotOpacity={0.4}
									inactiveDotScale={0.8}
									animatedTension={10}
								/>
							</>
						)}
					</View>

					{/* 본문 */}
					<Text style={styles.body}>{post.body}</Text>

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

					{/* 아이템 목록 */}
					<FlatList
						data={post.cart}
						keyExtractor={({ UniqueEntryID }) => UniqueEntryID}
						renderItem={({ item }) => (
							<View style={styles.itemContainer}>
								<View style={styles.itemDetails}>
									<Image
										source={{ uri: item.imageUrl }}
										style={styles.itemImage}
									/>
									<Text style={styles.itemName}>{item.name}</Text>
									{item.color && (
										<Text style={styles.itemColor}>{item.color}</Text>
									)}
								</View>
								<View style={styles.itemPriceContainer}>
									<Text style={styles.quantity}>{item.quantity}개</Text>
									<Ionicons name='close' size={14} />
									<Image
										source={{
											uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FMilesTicket.png?alt=media&token=f8e4f60a-1546-4084-9498-0f6f9e765859',
										}}
										style={styles.ticketIcon}
									/>
									<Text>{item.price}</Text>
								</View>
							</View>
						)}
					/>

					<View style={styles.totalContainer}>
						<Text style={styles.totalLabel}>일괄</Text>
						<View style={styles.totalPriceContainer}>
							<Image
								source={{
									uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FMilesTicket.png?alt=media&token=f8e4f60a-1546-4084-9498-0f6f9e765859',
								}}
								style={styles.ticketIcon}
							/>
							<Text style={styles.totalPrice}>
								{post.cart?.reduce(
									(acc: number, cur: { quantity: number; price: number }) =>
										acc + Number(cur.quantity) * Number(cur.price),
									0,
								)}
							</Text>
						</View>
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
		paddingHorizontal: 4,
	},
	header: {
		borderBottomWidth: 1,
		borderColor: Colors.border_gray,
		marginBottom: 16,
	},
	typeBadgeContainer: {
		flexDirection: 'row',
		marginLeft: -2,
		marginBottom: 12,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	userInfoContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		marginBottom: 8,
	},
	creatorDisplayName: {
		fontSize: 16,
		fontWeight: 600,
		color: Colors.font_gray,
	},
	creatorIslandInfo: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	islandImage: {
		width: 20,
		height: 20,
		marginLeft: 8,
	},
	islandName: {
		color: Colors.font_gray,
		marginLeft: 1,
	},
	date: {
		color: Colors.font_gray,
		marginBottom: 16,
	},
	carouselImage: {
		width: '100%',
		height: 250,
		borderRadius: 10,
		marginBottom: 10,
	},
	image: {
		width: '100%',
		height: 200,
		borderRadius: 10,
		marginBottom: 10,
	},
	body: {
		fontSize: 16,
		color: Colors.font_gray,
		marginBottom: 32,
	},
	itemContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: Colors.base,
		borderRadius: 10,
		marginBottom: 8,
	},
	itemDetails: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	itemImage: {
		width: 30,
		height: 30,
		borderRadius: 6,
	},
	itemName: {
		fontSize: 16,
		fontWeight: 600,
		marginLeft: 8,
	},
	itemColor: {
		fontSize: 14,
		color: Colors.font_gray,
		marginLeft: 8,
	},
	itemPriceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	quantity: {
		fontSize: 14,
		marginRight: 6,
	},
	ticketIcon: {
		width: 20,
		height: 20,
		marginLeft: 6,
		marginRight: 2,
	},
	totalContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: Colors.border_gray,
		paddingRight: 16,
		paddingVertical: 16,
	},
	totalLabel: {
		fontSize: 14,
		fontWeight: 600,
		marginRight: 8,
	},
	totalPriceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	totalPrice: {
		fontSize: 16,
		fontWeight: 'bold',
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

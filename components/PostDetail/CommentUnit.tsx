import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { Comment } from '@/hooks/useGetComments';
import { TabNavigation } from '@/types/navigation';
import { elapsedTime } from '@/utilities/elapsedTime';
import { getCreatorInfo } from '@/utilities/firebaseApi';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { ChatContext } from '../../Context/ChatContext';

type CommentCreatorInfo = {
	creatorDisplayName: string;
	creatorPhotoURL: string;
};

interface CommentUnitProps extends Comment {
	postId: string;
}

const CommentUnit = ({
	postId,
	id,
	body,
	creatorId,
	createdAt,
}: CommentUnitProps) => {
	const { showActionSheetWithOptions } = useActionSheet();
	const { userInfo } = useAuthContext();
	const [commentCreatorInfo, setCommentCreatorInfo] =
		useState<CommentCreatorInfo | null>(null);
	const navigation = useNavigation<TabNavigation>();
	// const { dispatch } = useContext(ChatContext);

	useEffect(() => {
		const getCommentCreatorInfo = async () => {
			const userInfo = await getCreatorInfo(creatorId);
			setCommentCreatorInfo(userInfo);
		};
		getCommentCreatorInfo();
	}, [creatorId]);

	const showCommentEditOptions = ({
		postId,
		commentId,
		comment,
	}: {
		postId: string;
		commentId: string;
		comment: string;
	}) => {
		const options = ['수정', '삭제', '취소'];
		const cancelButtonIndex = 2;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
			},
			(buttonIndex) => {
				if (buttonIndex === 0) editComment({ postId, commentId, comment });
				else if (buttonIndex === 1) deleteComment();
			},
		);
	};

	const editComment = async ({
		postId,
		commentId,
		comment,
	}: {
		postId: string;
		commentId: string;
		comment: string;
	}) => {
		navigation.navigate('EditComment', { postId, commentId, comment });
	};

	// 댓글 삭제
	const deleteComment = async () => {
		// Alert.alert('댓글 삭제', '정말로 삭제하시겠습니까?', [
		// 	{ text: '취소', style: 'cancel' },
		// 	{
		// 		text: '삭제',
		// 		style: 'destructive',
		// 		onPress: async () => {
		// 			try {
		// 				await deleteDoc(
		// 					doc(db, 'Boards', id, 'Comments', comment.commentId),
		// 				);
		// 				setIsCommentsUpdated((prev) => !prev);
		// 			} catch (error) {
		// 				console.log('❌ 댓글 삭제 오류:', error);
		// 			}
		// 		},
		// 	},
		// ]);
	};

	// 채팅 시작
	// const onChatClick = async () => {
	// if (!id || !userInfo) return;
	// const combinedId =
	// 	userInfo.uid > comment.creatorId
	// 		? userInfo.uid + comment.creatorId
	// 		: comment.creatorId + userInfo.uid;
	// try {
	// 	const response = await getDoc(doc(db, 'Chats', combinedId));
	// 	if (!response.exists()) {
	// 		await setDataToFirestore(doc(db, 'Chats', combinedId), {
	// 			messages: [],
	// 			participants: [userInfo.uid, comment.creatorId],
	// 		});
	// 	}
	// 	dispatch({
	// 		type: 'CHANGE_USER',
	// 		payload: {
	// 			uid: comment.creatorId,
	// 			displayName: comment.creatorDisplayName,
	// 			photoURL: comment.creatorPhotoURL,
	// 		},
	// 	});
	// 	// 채팅방으로 이동 (네비게이션 로직 필요)
	// } catch (error) {
	// 	console.log('❌ 채팅 오류:', error);
	// }
	// };

	return (
		<View style={styles.container}>
			<Image
				source={{ uri: commentCreatorInfo?.creatorPhotoURL }}
				style={styles.profileImage}
			/>
			<View style={styles.commentContent}>
				<View style={styles.commentHeader}>
					<Text style={styles.displayName}>
						{commentCreatorInfo?.creatorDisplayName}
					</Text>
					{/* {postCreatorId === comment.creatorId && (
									<Text style={styles.authorTag}>작성자</Text>
								)} */}
					{creatorId === userInfo?.uid && (
						<TouchableOpacity
							onPress={() =>
								showCommentEditOptions({ postId, commentId: id, comment: body })
							}
						>
							<View style={styles.menu}>
								<Entypo
									name='dots-three-vertical'
									size={14}
									color={Colors.font_gray}
								/>
							</View>
						</TouchableOpacity>
					)}
				</View>
				<Text style={styles.commentBody}>{body}</Text>
				<View style={styles.commentFooter}>
					<Text style={styles.time}>{elapsedTime(createdAt?.toDate())}</Text>
					{/* {postCreatorId === userInfo?.uid &&
									postCreatorId !== comment.creatorId && (
										<TouchableOpacity
											style={styles.chatButton}
											onPress={onChatClick}
										>
											<Text style={styles.chatText}>채팅하기</Text>
										</TouchableOpacity>
									)} */}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 12,
	},
	commentContent: {
		flex: 1,
	},
	commentHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	displayName: {
		fontSize: 14,
		fontWeight: 'bold',
		color: Colors.font_black,
	},
	authorTag: {
		fontSize: 12,
		color: 'red',
		marginLeft: 5,
	},
	menu: {
		padding: 5,
	},
	commentBody: {
		fontSize: 16,
		color: Colors.font_gray,
	},
	commentFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 6,
	},
	time: {
		fontSize: 12,
		color: Colors.primary,
	},
	// chatButton: { padding: 5, backgroundColor: '#5DB075', borderRadius: 5 },
	// chatText: { fontSize: 12, color: '#fff' },
	// editContainer: { padding: 10, backgroundColor: '#f9f9f9', borderRadius: 10 },
	// input: {
	// 	borderWidth: 1,
	// 	borderColor: '#ddd',
	// 	borderRadius: 5,
	// 	padding: 8,
	// 	minHeight: 60,
	// 	textAlignVertical: 'top',
	// },
	// buttonContainer: {
	// 	flexDirection: 'row',
	// 	justifyContent: 'flex-end',
	// 	marginTop: 5,
	// },
	// button: {
	// 	padding: 8,
	// 	backgroundColor: '#5DB075',
	// 	borderRadius: 5,
	// 	marginRight: 5,
	// },
	// buttonText: { color: '#fff', fontWeight: 'bold' },
	// cancelButton: { padding: 8, backgroundColor: '#ddd', borderRadius: 5 },
	// cancelText: { color: '#333' },
});

export default CommentUnit;

import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { Comment } from '@/hooks/useGetComments';
import { HomeStackNavigation, TabNavigation } from '@/types/navigation';
import { elapsedTime } from '@/utilities/elapsedTime';
import {
	createChatRoom,
	deleteComment as deleteCommentFromDB,
	getCreatorInfo,
} from '@/utilities/firebaseApi';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
// import { ChatContext } from '../../Context/ChatContext';

type CommentCreatorInfo = {
	creatorDisplayName: string;
	creatorPhotoURL: string;
};

interface CommentUnitProps extends Comment {
	commentRefresh: () => void;
	postId: string;
	postCreatorId: string;
}

const CommentUnit = ({
	commentRefresh,
	postId,
	postCreatorId,
	id,
	body,
	creatorId,
	createdAt,
}: CommentUnitProps) => {
	const { showActionSheetWithOptions } = useActionSheet();
	const { userInfo } = useAuthContext();
	const [commentCreatorInfo, setCommentCreatorInfo] =
		useState<CommentCreatorInfo | null>(null);
	const tabNavigation = useNavigation<TabNavigation>();
	const stackNavigation = useNavigation<HomeStackNavigation>();

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
				else if (buttonIndex === 1) deleteComment({ postId, commentId });
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
		stackNavigation.navigate('EditComment', { postId, commentId, comment });
	};

	const deleteComment = async ({
		postId,
		commentId,
	}: {
		postId: string;
		commentId: string;
	}) => {
		Alert.alert('댓글 삭제', '정말로 삭제하겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				onPress: () => handleDeleteComment({ postId, commentId }),
			},
		]);
	};

	const showAlert = (title: string, message: string, onPress?: () => void) => {
		Alert.alert(title, message, [{ text: '확인', onPress }]);
	};

	const handleDeleteComment = async ({
		postId,
		commentId,
	}: {
		postId: string;
		commentId: string;
	}) => {
		try {
			await deleteCommentFromDB({ postId, commentId });
			showAlert('삭제 완료', '댓글이 성공적으로 삭제되었습니다.', async () => {
				commentRefresh();
			});
		} catch (e: any) {
			showAlert('삭제 실패', '댓글 삭제 중 오류가 발생했습니다.');
			console.log('댓글 삭제 오류:', e);
		}
	};

	// 채팅 시작
	const onChatClick = async (receiverId: string) => {
		if (!userInfo) return;

		try {
			const chatId = await createChatRoom(userInfo.uid, receiverId);

			tabNavigation.navigate('Chat', {
				screen: 'ChatRoom',
				params: {
					chatId,
					receiverInfo: commentCreatorInfo,
				},
			});
		} catch (error) {
			Alert.alert('오류', '채팅방을 열 수 없습니다.');
		}
	};

	return (
		<View style={styles.container}>
			<Image
				source={{ uri: commentCreatorInfo?.creatorPhotoURL }}
				style={styles.profileImage}
			/>
			<View style={styles.commentContent}>
				{/* 헤더 */}
				<View style={styles.commentHeader}>
					<View style={styles.creatorInfo}>
						<Text style={styles.creatorDisplayNameText}>
							{commentCreatorInfo?.creatorDisplayName}
						</Text>
						{postCreatorId === creatorId && (
							<Text style={styles.authorTag}>작성자</Text>
						)}
					</View>
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

				{/* 바디 */}
				<Text style={styles.commentBody}>{body}</Text>

				{/* 푸터 */}
				<View style={styles.commentFooter}>
					<Text style={styles.time}>{elapsedTime(createdAt)}</Text>
					{postCreatorId === userInfo?.uid && postCreatorId !== creatorId && (
						<TouchableOpacity
							style={styles.chatButtonContainer}
							onPress={() => onChatClick(creatorId)}
						>
							<Text style={styles.chatText}>채팅하기</Text>
							<AntDesign
								name='arrowright'
								color={Colors.font_black}
								size={14}
							/>
						</TouchableOpacity>
					)}
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
		gap: 2,
	},
	commentHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	creatorInfo: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	creatorDisplayNameText: {
		fontSize: 14,
		fontWeight: 600,
		color: Colors.font_black,
	},
	authorTag: {
		backgroundColor: Colors.primary_background,
		color: Colors.primary_text,
		fontSize: 12,
		padding: 4,
		borderRadius: 4,
		marginHorizontal: 6,
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
	chatButtonContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 4,
		padding: 8,
		backgroundColor: 'white',
		borderRadius: 6,
		borderWidth: 1,
		borderColor: Colors.border_gray,
	},
	chatText: { fontSize: 14, color: Colors.font_black, fontWeight: 600 },
});

export default CommentUnit;

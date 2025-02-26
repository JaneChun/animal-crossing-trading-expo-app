import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { createChatRoom } from '@/firebase/services/chatService';
import { deleteComment as deleteCommentFromDB } from '@/firebase/services/commentService';
import { CommentUnitProps } from '@/types/components';
import { HomeStackNavigation, TabNavigation } from '@/types/navigation';
import { elapsedTime } from '@/utilities/elapsedTime';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
	Alert,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { showToast } from '../ui/Toast';

const CommentUnit = ({
	commentRefresh,
	postId,
	postCreatorId,
	id,
	body,
	creatorId,
	createdAt,
	updatedAt,
	creatorDisplayName,
	creatorIslandName,
	creatorPhotoURL,
}: CommentUnitProps) => {
	const { showActionSheetWithOptions } = useActionSheet();
	const { userInfo } = useAuthContext();
	const tabNavigation = useNavigation<TabNavigation>();
	const stackNavigation = useNavigation<HomeStackNavigation>();

	const showCommentEditOptions = ({
		postId,
		commentId,
		body,
	}: {
		postId: string;
		commentId: string;
		body: string;
	}) => {
		const options = ['수정', '삭제', '취소'];
		const cancelButtonIndex = 2;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
			},
			(buttonIndex) => {
				if (buttonIndex === 0) editComment({ postId, commentId, body });
				else if (buttonIndex === 1) deleteComment({ postId, commentId });
			},
		);
	};

	const editComment = async ({
		postId,
		commentId,
		body,
	}: {
		postId: string;
		commentId: string;
		body: string;
	}) => {
		stackNavigation.navigate('EditComment', { postId, commentId, body });
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

	const handleDeleteComment = async ({
		postId,
		commentId,
	}: {
		postId: string;
		commentId: string;
	}) => {
		try {
			await deleteCommentFromDB({ postId, commentId });
			showToast('success', '댓글이 삭제되었습니다.');
			commentRefresh();
		} catch (e: any) {
			showToast('error', '댓글 삭제 중 오류가 발생했습니다.');
		}
	};

	// 채팅 시작
	const onChatClick = async (receiverId: string) => {
		if (!userInfo) return;

		const chatId = await createChatRoom(userInfo.uid, receiverId);

		tabNavigation.navigate('ChatTab', {
			screen: 'ChatRoom',
			params: {
				chatId,
				receiverInfo: {
					uid: creatorId,
					diaplayName: creatorDisplayName,
					islandName: creatorIslandName,
					photoURL: creatorPhotoURL,
				},
			},
		});
	};

	return (
		<View style={styles.container}>
			<Image source={{ uri: creatorPhotoURL }} style={styles.profileImage} />
			<View style={styles.commentContent}>
				{/* 헤더 */}
				<View style={styles.commentHeader}>
					<View style={styles.creatorInfo}>
						<Text style={styles.creatorDisplayNameText}>
							{creatorDisplayName}
						</Text>
						{postCreatorId === creatorId && (
							<Text style={styles.authorTag}>작성자</Text>
						)}
					</View>
					{creatorId === userInfo?.uid && (
						<TouchableOpacity
							onPress={() =>
								showCommentEditOptions({ postId, commentId: id, body })
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

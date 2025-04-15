import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { useCreateChatRoom } from '@/hooks/mutation/chat/useCreateChatRoom';
import { useDeleteComment } from '@/hooks/mutation/comment/useDeleteComment';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { Collection, CommentUnitProps } from '@/types/components';
import { HomeStackNavigation, TabNavigation } from '@/types/navigation';
import { elapsedTime } from '@/utilities/elapsedTime';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionSheetButton from '../ui/ActionSheetButton';
import ImageWithFallback from '../ui/ImageWithFallback';
import { showToast } from '../ui/Toast';

const CommentUnit = ({
	postId,
	postCreatorId,
	id,
	body,
	creatorId,
	createdAt,
	creatorDisplayName,
	creatorIslandName,
	creatorPhotoURL,
}: CommentUnitProps) => {
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const isMarket = activeTab === 'Home' || activeTab === 'Profile';
	const collectionName = isMarket ? 'Boards' : 'Communities';
	const userInfo = useAuthStore((state) => state.userInfo);
	const tabNavigation = useNavigation<TabNavigation>();
	const stackNavigation = useNavigation<HomeStackNavigation>();
	const { mutate: deleteComment, isPending: isDeletingComment } =
		useDeleteComment(collectionName, postId, id);
	const { mutateAsync: createChatRoom, isPending: isCreatingChatRoom } =
		useCreateChatRoom();

	const handleEditComment = ({
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

	const handleDeleteComment = async () => {
		Alert.alert('댓글 삭제', '정말로 삭제하겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				onPress: async () => await onConfirmDeleteComment(),
			},
		]);
	};

	const onConfirmDeleteComment = async () => {
		deleteComment(undefined, {
			onSuccess: () => {
				showToast('success', '댓글이 삭제되었습니다.');
			},
			onError: (e) => {
				showToast('error', '댓글 삭제 중 오류가 발생했습니다.');
			},
		});
	};

	// 채팅 시작
	const onChatClick = async ({
		collectionName,
		postId,
		receiverId,
	}: {
		collectionName: Collection;
		postId: string;
		receiverId: string;
	}) => {
		if (!userInfo) return;

		const chatId = await createChatRoom({
			collectionName,
			postId,
			user1: userInfo.uid,
			user2: receiverId,
		});

		if (!chatId) return;

		tabNavigation.navigate('ChatTab', {
			screen: 'ChatRoom',
			params: {
				chatId,
			},
		});
	};

	const navigateToProfile = ({ creatorId }: { creatorId: string }) => {
		stackNavigation.navigate('Profile', { userId: creatorId });
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={() => navigateToProfile({ creatorId })}>
				<ImageWithFallback
					uri={creatorPhotoURL}
					fallbackSource={require('../../assets/images/empty_profile_image.png')}
					style={styles.profileImage}
				/>
			</TouchableOpacity>

			<View style={styles.commentContent}>
				{/* 헤더 */}
				<View style={styles.commentHeader}>
					<View style={styles.creatorInfo}>
						<TouchableOpacity onPress={() => navigateToProfile({ creatorId })}>
							<Text style={styles.creatorDisplayNameText}>
								{creatorDisplayName}
							</Text>
						</TouchableOpacity>
						{postCreatorId === creatorId && (
							<Text style={styles.authorTag}>작성자</Text>
						)}
					</View>
					{creatorId === userInfo?.uid && (
						<ActionSheetButton
							color={Colors.font_gray}
							size={14}
							options={[
								{
									label: '수정',
									onPress: () =>
										handleEditComment({ postId, commentId: id, body }),
								},
								{
									label: '삭제',
									onPress: handleDeleteComment,
								},
								{ label: '취소', onPress: () => {} },
							]}
						/>
					)}
				</View>

				{/* 바디 */}
				<Text style={styles.commentBody}>{body}</Text>

				{/* 푸터 */}
				<View style={styles.commentFooter}>
					<Text style={styles.time}>{elapsedTime(createdAt)}</Text>
					{/* 내 게시글의 다른 사람 댓글만 표시 */}
					{postCreatorId === userInfo?.uid &&
						postCreatorId !== creatorId &&
						creatorDisplayName !== DEFAULT_USER_DISPLAY_NAME && (
							<TouchableOpacity
								style={styles.chatButtonContainer}
								onPress={() =>
									onChatClick({ collectionName, postId, receiverId: creatorId })
								}
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

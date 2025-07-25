import { Colors } from '@/constants/Color';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { generateChatId } from '@/firebase/services/chatService';
import { useDeleteComment } from '@/hooks/comment/mutation/useDeleteComment';
import { usePostContext } from '@/hooks/post/usePostContext';
import { useBlockUser } from '@/hooks/shared/useBlockUser';
import { useUserInfo } from '@/stores/auth';
import { CreateChatRoomParams, SendChatMessageParams } from '@/types/chat';
import { CommentUnitProps } from '@/types/components';
import { Collection } from '@/types/post';
import { createSystemMessage } from '@/utilities/createSystemMessage';
import { elapsedTime } from '@/utilities/elapsedTime';
import {
	navigateToChatRoom,
	navigateToUserProfile,
} from '@/utilities/navigationHelpers';
import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import {
	Alert,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import ActionSheetButton from '../ui/ActionSheetButton';
import ImageWithFallback from '../ui/ImageWithFallback';
import { showToast } from '../ui/Toast';

const CommentUnit = ({
	postId,
	postCreatorId,
	chatRoomIds,
	onReportClick,
	onEditClick,
	// Comment props
	id,
	body,
	creatorId,
	createdAt,
	creatorDisplayName,
	creatorIslandName,
	creatorPhotoURL,
}: CommentUnitProps) => {
	const { collectionName } = usePostContext();
	const userInfo = useUserInfo();

	// 차단
	const { isBlockedByMe, toggleBlock: onToggleBlock } = useBlockUser({
		targetUserId: creatorId,
		targetUserDisplayName: creatorDisplayName,
	});

	const { mutate: deleteComment, isPending: isDeletingComment } =
		useDeleteComment(collectionName as Collection, postId, id);

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

		const chatId = generateChatId(userInfo.uid, receiverId);

		// 채팅방 정보는 항상 전달
		const chatStartInfo: CreateChatRoomParams = {
			collectionName,
			postId,
			user1: userInfo.uid,
			user2: receiverId,
		};

		// 해당 게시글로 생성된 채팅방이 처음일 경우에만 systemMessage 포함하여 채팅방으로 이동
		const systemMessage: SendChatMessageParams = createSystemMessage({
			chatId,
			collectionName,
			postId,
		});

		navigateToChatRoom({
			chatId,
			chatStartInfo,
			...(!chatRoomIds.includes(chatId) ? { systemMessage } : {}),
		});
	};

	const onPressUserProfile = () => {
		if (creatorDisplayName === DEFAULT_USER_DISPLAY_NAME) return;

		navigateToUserProfile({ userId: creatorId });
	};

	const isAuthor = creatorId === userInfo?.uid;
	const options = [
		...(isAuthor
			? [
					{
						label: '수정',
						onPress: () => onEditClick({ commentId: id, commentText: body }),
					},
					{
						label: '삭제',
						onPress: handleDeleteComment,
					},
			  ]
			: [
					{
						label: isBlockedByMe ? '차단 해제' : '차단',
						onPress: onToggleBlock,
					},
					{
						label: '신고',
						onPress: () =>
							onReportClick({ commentId: id, reporteeId: creatorId }),
					},
			  ]),
		{ label: '취소', onPress: () => {} },
	].filter(Boolean) as { label: string; onPress: () => void }[];

	return (
		<View style={styles.container}>
			{/* 프로필 이미지 */}
			<Pressable onPress={onPressUserProfile}>
				<ImageWithFallback
					uri={creatorPhotoURL}
					fallbackSource={require('../../assets/images/empty_profile_image.png')}
					style={styles.profileImage}
				/>
			</Pressable>

			<View style={styles.content}>
				{/* 헤더 */}
				<View style={styles.commentHeader}>
					{/* 작성자 */}
					<View style={styles.creatorInfo}>
						<Pressable onPress={onPressUserProfile}>
							<Text style={styles.creatorDisplayNameText}>
								{creatorDisplayName}
							</Text>
						</Pressable>
						{postCreatorId === creatorId && (
							<Text style={styles.authorTag}>작성자</Text>
						)}
					</View>
					{/* 액션 시트 버튼 */}
					<View style={styles.actionContainer}>
						{userInfo && (
							<ActionSheetButton
								color={Colors.font_gray}
								size={14}
								options={options}
							/>
						)}
					</View>
				</View>

				{/* 섬 이름, 작성 시간 */}
				<Text style={styles.infoText}>{`${creatorIslandName} · ${elapsedTime(
					createdAt,
				)}`}</Text>

				{/* 바디 */}
				<Text style={styles.commentBody}>{body}</Text>

				{/* 푸터 */}
				<View style={styles.commentFooter}>
					{/* 내 게시글의 다른 사람 댓글만 표시 */}
					{postCreatorId === userInfo?.uid &&
						postCreatorId !== creatorId &&
						creatorDisplayName !== DEFAULT_USER_DISPLAY_NAME && (
							<TouchableOpacity
								style={styles.chatButtonContainer}
								onPress={() =>
									onChatClick({ collectionName, postId, receiverId: creatorId })
								}
								testID='startChatButton'
							>
								<Text style={styles.chatText}>채팅하기</Text>
								<AntDesign name='arrowright' color={Colors.primary} size={14} />
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
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 12,
	},
	content: {
		flex: 1,
	},
	commentHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	creatorInfo: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	creatorDisplayNameText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
	},
	authorTag: {
		backgroundColor: Colors.primary_background,
		color: Colors.primary_text,
		fontSize: FontSizes.xs,
		padding: 4,
		borderRadius: 4,
		marginHorizontal: 6,
	},
	actionContainer: {
		height: 28,
		alignItems: 'flex-end',
	},
	infoText: {
		fontSize: FontSizes.xs,
		color: Colors.font_gray,
		marginBottom: 6,
	},
	commentBody: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.regular,
		color: Colors.font_dark_gray,
		lineHeight: 24,
	},
	commentFooter: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	chatButtonContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 4,
		marginTop: 4,
		paddingVertical: 10,
		paddingHorizontal: 14,
		backgroundColor: 'white',
		borderRadius: 50,
		borderWidth: 1,
		borderColor: Colors.primary,
	},
	chatText: {
		fontSize: FontSizes.sm,
		color: Colors.primary,
		fontWeight: FontWeights.semibold,
	},
});

export default CommentUnit;

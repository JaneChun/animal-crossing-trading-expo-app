import { FontAwesome } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import ActionSheetButton from '@/components/ui/ActionSheetButton';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { showToast } from '@/components/ui/Toast';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { usePostContext } from '@/hooks/post/usePostContext';
import { useDeleteReply } from '@/hooks/reply/mutation/useDeleteReply';
import { useBlockUser } from '@/hooks/shared/useBlockUser';
import { useUserInfo } from '@/stores/auth';
import { FontSizes , Theme, useThemedStyles } from '@/theme';
import { ReplyUnitProps } from '@/types/components';
import { Collection } from '@/types/post';
import { elapsedTime } from '@/utilities/elapsedTime';
import { navigateToUserProfile } from '@/utilities/navigationHelpers';
import emptyProfileImage from '@assets/images/empty_profile_image.png';

const ReplyUnit = ({
	postId,
	postCreatorId,
	commentId,
	mentionTag,
	onReportClick,
	onEditClick,
	onReplyClick,
	// Reply props
	id,
	body,
	creatorId,
	createdAt,
	creatorDisplayName,
	creatorIslandName,
	creatorPhotoURL,
}: ReplyUnitProps) => {
	const styles = useThemedStyles(makeStyles);
	const { collectionName } = usePostContext();
	const userInfo = useUserInfo();

	// 차단
	const { isBlockedByMe, toggleBlock: onToggleBlock } = useBlockUser({
		targetUserId: creatorId,
		targetUserDisplayName: creatorDisplayName,
		source: 'comment',
	});

	// 답글 삭제
	const { mutate: deleteReply } = useDeleteReply(
		collectionName as Collection,
		postId,
		commentId,
		id,
	);

	const handleDeleteReply = async () => {
		Alert.alert('답글 삭제', '정말로 삭제하겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				onPress: async () => await onConfirmDeleteReply(),
			},
		]);
	};

	const onConfirmDeleteReply = async () => {
		deleteReply(undefined, {
			onSuccess: () => {
				showToast('success', '답글이 삭제되었습니다.');
			},
			onError: (e) => {
				showToast('error', '답글 삭제 중 오류가 발생했습니다.');
			},
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
						onPress: () => onEditClick({ replyId: id, replyText: body }),
					},
					{
						label: '삭제',
						onPress: handleDeleteReply,
					},
				]
			: [
					{
						label: isBlockedByMe ? '차단 해제' : '차단',
						onPress: onToggleBlock,
					},
					{
						label: '신고',
						onPress: () => onReportClick({ commentId, replyId: id, reporteeId: creatorId }),
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
					fallbackSource={emptyProfileImage}
					style={styles.profileImage}
				/>
			</Pressable>

			<View style={styles.content}>
				{/* 헤더 */}
				<View style={styles.replyHeader}>
					{/* 작성자 */}
					<View style={styles.creatorInfo}>
						<Pressable onPress={onPressUserProfile}>
							<Text variant="body2" weight="semibold">
								{creatorDisplayName}
							</Text>
						</Pressable>
						{postCreatorId === creatorId && (
							<Text variant="caption" color="primaryBrand" style={styles.authorTag}>
								작성자
							</Text>
						)}
					</View>
					{/* 액션 시트 버튼 */}
					<View style={styles.actionContainer}>
						{userInfo && (
							<ActionSheetButton
								color={styles.actionIcon.color}
								size={14}
								options={options}
							/>
						)}
					</View>
				</View>

				{/* 섬 이름, 작성 시간 */}
				<Text variant="caption" color="tertiary" style={styles.infoText}>
					{`${creatorIslandName} · ${elapsedTime(createdAt)}`}
				</Text>

				{/* 바디 */}
				<Text variant="body1" color="secondary" style={styles.replyBody}>
					{mentionTag && (
						<Text weight="semibold" color="tertiary">
							@{mentionTag}{' '}
						</Text>
					)}
					{body}
				</Text>

				{/* 푸터 */}
				<View style={styles.replyFooter}>
					{/* 답글 버튼 - 모든 대댓글에 표시 */}
					{userInfo && creatorDisplayName !== DEFAULT_USER_DISPLAY_NAME && (
						<TouchableOpacity
							style={styles.replyButton}
							onPress={() =>
								onReplyClick({
									commentId: commentId,
									parentId: id,
									parentDisplayName: creatorDisplayName,
								})
							}
						>
							<View style={styles.replyIconContainer}>
								<FontAwesome name="reply" style={styles.replyIcon} />
							</View>
							<Text variant="caption" color="tertiary">
								답글 달기
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		</View>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			paddingVertical: 8,
		},
		profileImage: {
			width: 25,
			height: 25,
			borderRadius: 20,
			marginRight: 8,
		},
		content: {
			flex: 1,
		},
		replyHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		creatorInfo: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		authorTag: {
			backgroundColor: colors.bg.primaryBrand,
			padding: 4,
			borderRadius: 4,
			marginHorizontal: 6,
		},
		actionContainer: {
			height: 28,
			alignItems: 'flex-end',
		},
		actionIcon: {
			color: colors.text.tertiary,
		},
		infoText: {
			marginBottom: 6,
		},
		replyBody: {
			lineHeight: 22,
		},
		replyFooter: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			// alignItems: 'center',
			gap: 12,
			marginTop: 8,
		},
		replyButton: {
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: 4,
		},
		replyIconContainer: {
			transform: [{ rotateX: '180deg' }, { rotateY: '180deg' }],
		},
		replyIcon: {
			fontSize: FontSizes.xs,
			color: colors.icon.default,
		},
	});

export default ReplyUnit;

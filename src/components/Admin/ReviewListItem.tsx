import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { usePostDetail } from '@/hooks/post/query/usePostDetail';
import { Spacing, useTheme } from '@/theme';
import { ReviewWithId } from '@/types/review';
import { elapsedTime } from '@/utilities/elapsedTime';

import UserIdRow from './UserIdRow';

type ReviewListItemProps = {
	review: ReviewWithId;
	/** 행에 그릴 상대 유저: 받은 리뷰면 작성자, 보낸 리뷰면 받은 사람 */
	counterpartId: string;
};

const ReviewListItem = ({ review, counterpartId }: ReviewListItemProps) => {
	const { colors } = useTheme();
	// 리뷰는 거래글(Boards)에서만 생긴다. 영구 삭제된 글이면 제목 줄을 그리지 않는다
	const { data: post } = usePostDetail('Boards', review.postId, { includeHidden: true });

	const renderFace = () => {
		if (review.value === 1) {
			return (
				<FontAwesome6
					name="smile-beam"
					size={20}
					color={colors.icon.green}
					accessibilityLabel="만족"
				/>
			);
		}
		if (review.value === -1) {
			return (
				<FontAwesome6
					name="frown-open"
					size={20}
					color={colors.icon.red}
					accessibilityLabel="불만족"
				/>
			);
		}
		return null;
	};

	return (
		<UserIdRow
			uid={counterpartId}
			subtitle={
				!!post && (
					<Text
						variant="caption"
						color="tertiary"
						numberOfLines={1}
						style={styles.postTitle}
					>
						{post.title}
					</Text>
				)
			}
			right={
				<View style={styles.right}>
					<Text variant="caption" color="tertiary">
						{elapsedTime(review.createdAt)}
					</Text>
					{renderFace()}
				</View>
			}
		/>
	);
};

export default ReviewListItem;

const styles = StyleSheet.create({
	postTitle: {
		marginTop: Spacing.xs,
	},
	right: {
		alignSelf: 'stretch',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		gap: 6,
	},
});

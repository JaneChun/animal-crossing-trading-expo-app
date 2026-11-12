import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';
import { BorderRadius } from '@/theme/BorderRadius';
import { Spacing } from '@/theme/Spacing';
import { type NeedsReviewLineMatchResult } from '@/types/bulkItemMatching';
import { type CatalogItem } from '@/types/catalog';
import { getBulkAddCartId } from '@/utilities/catalogItemToItem';

import ItemName from './ItemName';

type ReviewGroupProps = {
	reviewItem: NeedsReviewLineMatchResult;
	selectedItemId?: string;
	cartIds: Set<string>;
	onSelectCandidate: (line: string, item: CatalogItem) => void;
};

// 후보가 여러 개라 사용자가 골라야 하는 라인 + 후보 목록
const ReviewGroup = ({
	reviewItem,
	selectedItemId,
	cartIds,
	onSelectCandidate,
}: ReviewGroupProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
	<View style={styles.reviewGroup}>
		<Text
			variant="body2"
			weight="medium"
			color="secondary"
			numberOfLines={2}
			ellipsizeMode="tail"
		>
			{reviewItem.line}
		</Text>
		{reviewItem.candidates.map((item) => {
			const isSelected = selectedItemId === item.id;
			const isDuplicate = cartIds.has(getBulkAddCartId(item));

			return (
				<TouchableOpacity
					key={item.id}
					style={styles.candidateRow}
					onPress={() => onSelectCandidate(reviewItem.line, item)}
					disabled={isDuplicate}
					activeOpacity={0.72}
					testID={`bulkAddReviewCandidate-${item.id}`}
				>
					<ImageWithFallback
						uri={item.imageUrl}
						style={[styles.candidateImage, isDuplicate && styles.dimmed]}
					/>
					<ItemName
						item={item}
						weight="semibold"
						nameStyle={styles.candidateName}
						isDuplicate={isDuplicate}
					/>
					{isDuplicate ? (
						<Text
							variant="micro"
							weight="semibold"
							color="tertiary"
							style={[styles.chip, styles.duplicateChip]}
						>
							이미 담김
						</Text>
					) : (
						<Ionicons
							name={isSelected ? 'checkbox' : 'square-outline'}
							size={24}
							color={isSelected ? styles.checkboxSelected.color : styles.checkbox.color}
						/>
					)}
				</TouchableOpacity>
			);
		})}
	</View>
	);
};

export default ReviewGroup;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
	reviewGroup: {
		marginBottom: Spacing.l,
		gap: Spacing.s,
	},
	candidateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: Spacing.m,
		paddingHorizontal: Spacing.l,
		borderRadius: BorderRadius.l,
		borderWidth: 1,
		borderColor: colors.border.default,
		backgroundColor: colors.bg.primary,
	},
	candidateImage: {
		width: 30,
		height: 30,
		marginRight: Spacing.m,
		borderRadius: BorderRadius.s,
	},
	candidateName: {
		flex: 1,
		marginRight: Spacing.s,
	},
	checkbox: {
		color: colors.border.default,
	},
	checkboxSelected: {
		color: colors.brand.primary,
	},
	chip: {
		backgroundColor: colors.bg.tertiary,
		borderRadius: BorderRadius.full,
		paddingVertical: 3,
		paddingHorizontal: Spacing.s,
		overflow: 'hidden',
	},
	duplicateChip: {
		backgroundColor: colors.bg.secondary,
	},
	dimmed: {
		opacity: 0.45,
	},
});

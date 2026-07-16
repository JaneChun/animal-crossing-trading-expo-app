import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { FontSizes, FontWeights, LineHeights } from '@/constants/Typography';
import { BorderRadius } from '@/theme/BorderRadius';
import { Colors } from '@/theme/Color';
import { Spacing } from '@/theme/Spacing';
import { type NeedsReviewLineMatchResult } from '@/types/bulkItemMatching';
import { type CatalogItem } from '@/types/catalog';

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
}: ReviewGroupProps) => (
	<View style={styles.reviewGroup}>
		<Text style={styles.reviewLine} numberOfLines={2} ellipsizeMode="tail">
			{reviewItem.line}
		</Text>
		{reviewItem.candidates.map((item) => {
			const isSelected = selectedItemId === item.id;
			const isDuplicate = cartIds.has(item.id);

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
						nameStyle={styles.candidateName}
						isDuplicate={isDuplicate}
					/>
					{isDuplicate ? (
						<Text style={[styles.chip, styles.duplicateChip]}>이미 담김</Text>
					) : (
						<Ionicons
							name={isSelected ? 'checkbox' : 'square-outline'}
							size={24}
							color={isSelected ? Colors.brand.primary : Colors.border.default}
						/>
					)}
				</TouchableOpacity>
			);
		})}
	</View>
);

export default ReviewGroup;

const styles = StyleSheet.create({
	reviewGroup: {
		marginBottom: Spacing.l,
		gap: Spacing.s,
	},
	reviewLine: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		lineHeight: LineHeights.sm,
		color: Colors.text.secondary,
	},
	candidateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: Spacing.m,
		paddingHorizontal: Spacing.l,
		borderRadius: BorderRadius.l,
		borderWidth: 1,
		borderColor: Colors.border.default,
		backgroundColor: Colors.bg.primary,
	},
	candidateImage: {
		width: 30,
		height: 30,
		marginRight: Spacing.m,
		borderRadius: BorderRadius.s,
	},
	candidateName: {
		flex: 1,
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		lineHeight: LineHeights.md,
		color: Colors.text.primary,
		marginRight: Spacing.s,
	},
	chip: {
		fontSize: FontSizes.xxs,
		fontWeight: FontWeights.semibold,
		lineHeight: LineHeights.xxs,
		color: Colors.text.tertiary,
		backgroundColor: Colors.bg.tertiary,
		borderRadius: BorderRadius.full,
		paddingVertical: 3,
		paddingHorizontal: Spacing.s,
		overflow: 'hidden',
	},
	duplicateChip: {
		color: Colors.text.tertiary,
		backgroundColor: Colors.bg.secondary,
	},
	dimmed: {
		opacity: 0.45,
	},
});

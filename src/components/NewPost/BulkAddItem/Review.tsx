import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';

import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { MAX_CART_ITEMS } from '@/constants/post';
import { BorderRadius } from '@/theme/BorderRadius';
import { Colors } from '@/theme/Color';
import { Spacing } from '@/theme/Spacing';
import {
	type BulkReviewFoundItem,
	type BulkReviewNeedsReviewItem,
	type FailedLineMatchResult,
} from '@/types/bulkItemMatching';
import { type CartItem, type Item } from '@/types/post';

import FailedRow from './FailedRow';
import FoundRow from './FoundRow';
import ReviewGroup from './ReviewGroup';
import SectionBanner from './SectionBanner';

type ReviewProps = {
	cart: CartItem[];
	foundItems: BulkReviewFoundItem[];
	reviewItems: BulkReviewNeedsReviewItem[];
	failedResults: FailedLineMatchResult[];
	selectedReviewItems: Record<string, Item>;
	selectedCount: number;
	isOverCapacity: boolean;
	onSelectReviewCandidate: (line: string, item: Item) => void;
	onConfirm: () => void;
};

const Review = ({
	cart,
	foundItems,
	reviewItems,
	failedResults,
	selectedReviewItems,
	selectedCount,
	isOverCapacity,
	onSelectReviewCandidate,
	onConfirm,
}: ReviewProps) => {
	const cartIds = new Set(cart.map((cartItem) => cartItem.id));

	return (
		<View style={styles.container}>
			<BottomSheetScrollView
				style={styles.scrollArea}
				contentContainerStyle={styles.scrollContent}
			>
				{foundItems.length > 0 && (
					<>
						<SectionBanner
							variant="found"
							text={`아이템 ${foundItems.length}개를 찾았어요`}
							spaced={false}
						/>
						{foundItems.map(({ line, item }) => (
							<FoundRow
								key={`${line}-${item.id}`}
								item={item}
								isDuplicate={cartIds.has(item.id)}
							/>
						))}
					</>
				)}

				{reviewItems.length > 0 && (
					<>
						<SectionBanner
							variant="review"
							text="맞는 아이템을 골라주세요"
							spaced={foundItems.length > 0}
						/>
						{reviewItems.map((reviewItem) => (
							<ReviewGroup
								key={reviewItem.line}
								reviewItem={reviewItem}
								selectedItemId={selectedReviewItems[reviewItem.line]?.id}
								cartIds={cartIds}
								onSelectCandidate={onSelectReviewCandidate}
							/>
						))}
					</>
				)}

				{failedResults.length > 0 && (
					<>
						<SectionBanner
							variant="failed"
							text="찾지 못한 텍스트예요"
							spaced={foundItems.length > 0 || reviewItems.length > 0}
						/>
						{failedResults.map((result, index) => (
							<FailedRow
								key={`${result.line}-${index}`}
								line={result.line}
								index={index}
							/>
						))}
					</>
				)}
			</BottomSheetScrollView>

			<View style={styles.footer}>
				{isOverCapacity && (
					<ErrorMessage
						message={`아이템은 최대 ${MAX_CART_ITEMS}개까지 담을 수 있어요. (현재 카트: ${cart.length}개)`}
						containerStyle={styles.warning}
					/>
				)}
				<Button
					color="mint"
					size="lg2"
					onPress={onConfirm}
					disabled={selectedCount === 0 || isOverCapacity}
					testID="bulkAddConfirmButton"
					style={styles.confirmButton}
				>
					{selectedCount}개 추가하기
				</Button>
			</View>
		</View>
	);
};

export default Review;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.bg.primary,
	},
	scrollArea: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: Spacing.xl,
		paddingHorizontal: Spacing.xl,
		paddingBottom: Spacing.xl,
	},
	footer: {
		gap: Spacing.m,
		paddingTop: Spacing.m,
		paddingHorizontal: Spacing.xl,
		borderTopWidth: 1,
		borderTopColor: Colors.border.default,
		backgroundColor: Colors.bg.primary,
	},
	warning: {
		marginTop: 0,
	},
	confirmButton: {
		borderRadius: BorderRadius.m,
	},
});

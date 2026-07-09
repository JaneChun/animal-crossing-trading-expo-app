import { Feather, Ionicons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';

import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { MAX_CART_ITEMS } from '@/constants/post';
import { FontSizes, FontWeights, LineHeights } from '@/constants/Typography';
import { type BulkFailedResult } from '@/hooks/item/query/useMatchCatalogItems';
import { BorderRadius } from '@/theme/BorderRadius';
import { Colors } from '@/theme/Color';
import { Spacing } from '@/theme/Spacing';
import {
	type BulkReviewCandidate,
	type BulkReviewFoundItem,
	type BulkReviewNeedsReviewItem,
} from '@/types/bulk-item-matching';
import { type CartItem, type Item } from '@/types/post';

type BulkAddItemReviewProps = {
	cart: CartItem[];
	foundItems: BulkReviewFoundItem[];
	reviewItems: BulkReviewNeedsReviewItem[];
	failedResults: BulkFailedResult[];
	selectedReviewItems: Record<string, Item>;
	selectedCount: number;
	isOverCapacity: boolean;
	onSelectReviewCandidate: (line: string, item: Item) => void;
	onConfirm: () => void;
};

const BulkAddItemReview = ({
	cart,
	foundItems,
	reviewItems,
	failedResults,
	selectedReviewItems,
	selectedCount,
	isOverCapacity,
	onSelectReviewCandidate,
	onConfirm,
}: BulkAddItemReviewProps) => {
	const cartIds = new Set(cart.map((cartItem) => cartItem.id));

	const renderItemName = (item: Item, nameStyle: TextStyle, isDuplicate: boolean) => (
		<Text
			style={[nameStyle, isDuplicate && styles.dimmedText]}
			numberOfLines={1}
			ellipsizeMode="tail"
		>
			{item.name}
			{item.color && (
				<Text style={[styles.itemColor, isDuplicate && styles.dimmedText]}>
					{` (${item.color})`}
				</Text>
			)}
		</Text>
	);

	const renderFoundRow = ({ line, item }: BulkReviewFoundItem) => {
		const isDuplicate = cartIds.has(item.id);

		return (
			<View
				key={`${line}-${item.id}`}
				style={styles.row}
				testID={`bulkAddFoundRow-${item.id}`}
			>
				<ImageWithFallback
					uri={item.imageUrl}
					style={[styles.itemImage, isDuplicate && styles.dimmed]}
				/>
				{renderItemName(item, styles.itemName, isDuplicate)}
				{isDuplicate && <Text style={[styles.chip, styles.duplicateChip]}>이미 담김</Text>}
			</View>
		);
	};

	const renderReviewCandidate = (line: string, { item }: BulkReviewCandidate) => {
		const isSelected = selectedReviewItems[line]?.id === item.id;
		const isDuplicate = cartIds.has(item.id);

		return (
			<TouchableOpacity
				key={item.id}
				style={styles.candidateRow}
				onPress={() => onSelectReviewCandidate(line, item)}
				disabled={isDuplicate}
				activeOpacity={0.72}
				testID={`bulkAddReviewCandidate-${item.id}`}
			>
				<ImageWithFallback
					uri={item.imageUrl}
					style={[styles.candidateImage, isDuplicate && styles.dimmed]}
				/>
				{renderItemName(item, styles.candidateName, isDuplicate)}
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
	};

	const renderReviewItem = (reviewItem: BulkReviewNeedsReviewItem) => (
		<View key={reviewItem.line} style={styles.reviewGroup}>
			<Text style={styles.reviewLine} numberOfLines={2} ellipsizeMode="tail">
				{reviewItem.line}
			</Text>
			{reviewItem.candidates.map((candidate) =>
				renderReviewCandidate(reviewItem.line, candidate),
			)}
		</View>
	);

	const renderFailedRow = (result: BulkFailedResult, index: number) => (
		<Text
			key={`${result.line}-${index}`}
			style={styles.failedLine}
			numberOfLines={2}
			ellipsizeMode="tail"
			testID={`bulkAddFailedRow-${index}`}
		>
			{result.line}
		</Text>
	);

	return (
		<View style={styles.container}>
			<BottomSheetScrollView
				style={styles.scrollArea}
				contentContainerStyle={styles.scrollContent}
			>
				{foundItems.length > 0 && (
					<>
						<View style={[styles.banner, styles.bannerFound]}>
							<Feather name="search" size={15} color={Colors.text.primaryBrand} />
							<Text style={[styles.bannerText, styles.bannerTextFound]}>
								아이템 {foundItems.length}개를 찾았어요
							</Text>
						</View>
						{foundItems.map(renderFoundRow)}
					</>
				)}

				{reviewItems.length > 0 && (
					<>
						<View
							style={[
								styles.banner,
								styles.bannerReview,
								foundItems.length > 0 && styles.bannerSpaced,
							]}
						>
							<Feather name="alert-circle" size={15} color={Colors.text.yellow} />
							<Text style={[styles.bannerText, styles.bannerTextReview]}>
								맞는 아이템을 골라주세요
							</Text>
						</View>
						{reviewItems.map(renderReviewItem)}
					</>
				)}

				{failedResults.length > 0 && (
					<>
						<View
							style={[
								styles.banner,
								styles.bannerFailed,
								(foundItems.length > 0 || reviewItems.length > 0) &&
								styles.bannerSpaced,
							]}
						>
							<Feather name="help-circle" size={15} color={Colors.text.red} />
							<Text style={[styles.bannerText, styles.bannerTextFailed]}>
								찾지 못한 텍스트예요
							</Text>
						</View>
						{failedResults.map(renderFailedRow)}
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

export default BulkAddItemReview;

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
	banner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.s,
		borderRadius: BorderRadius.m,
		paddingVertical: Spacing.m,
		paddingHorizontal: Spacing.l,
		marginBottom: Spacing.m,
	},
	bannerSpaced: {
		marginTop: Spacing.l,
	},
	bannerFound: {
		backgroundColor: Colors.bg.primaryBrand,
	},
	bannerReview: {
		backgroundColor: Colors.bg.yellow,
	},
	bannerFailed: {
		backgroundColor: Colors.bg.red,
	},
	bannerText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		lineHeight: LineHeights.sm,
	},
	bannerTextFound: {
		color: Colors.text.primaryBrand,
	},
	bannerTextReview: {
		color: Colors.text.yellow,
	},
	bannerTextFailed: {
		color: Colors.text.red,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 58,
		paddingVertical: Spacing.s,
		paddingHorizontal: Spacing.s,
		borderRadius: BorderRadius.m,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border.default,
	},
	itemImage: {
		width: 40,
		height: 40,
		marginRight: Spacing.m,
		borderRadius: BorderRadius.m,
	},
	itemName: {
		flex: 1,
		fontSize: FontSizes.md,
		fontWeight: FontWeights.medium,
		lineHeight: LineHeights.md,
		color: Colors.text.primary,
		marginRight: Spacing.s,
	},
	itemColor: {
		fontWeight: FontWeights.regular,
		color: Colors.text.tertiary,
	},
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
	failedLine: {
		fontSize: FontSizes.sm,
		lineHeight: LineHeights.sm,
		color: Colors.text.tertiary,
		paddingVertical: Spacing.s,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border.default,
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
	dimmedText: {
		color: Colors.text.tertiary,
	},
	warning: {
		marginTop: 0,
	},
	confirmButton: {
		borderRadius: BorderRadius.m,
	},
});

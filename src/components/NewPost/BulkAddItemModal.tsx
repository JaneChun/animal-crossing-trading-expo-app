import {
	type ComponentProps,
	type ComponentType,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';

import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { showToast } from '@/components/ui/Toast';
import { MAX_CART_ITEMS } from '@/constants/post';
import { FontSizes, FontWeights, LineHeights } from '@/constants/Typography';
import {
	type BulkFailedResult,
	type BulkMatchOutput,
	type BulkNeedsReviewResult,
	useMatchCatalogItems,
} from '@/hooks/item/query/useMatchCatalogItems';
import { Colors } from '@/theme/Color';
import { type BulkAddItemModalProps } from '@/types/components';
import { type Item } from '@/types/post';
import { logBulkAddConfirm, logBulkAddSearch } from '@/utilities/analytics';
import { catalogItemToItem } from '@/utilities/catalogItemToItem';

import BulkAddItemReview, { type BulkReviewMatchedItem } from './BulkAddItemReview';
import ThreeDotsLoadingIndicator from '../ui/loading/ThreeDotsLoadingIndicator';

type BulkReviewFoundItem = {
	line: string;
	item: Item;
};

type BulkReviewNeedsReviewItem = {
	line: string;
	searchTerm: string;
	source: BulkNeedsReviewResult['source'];
	candidates: {
		item: Item;
		category: string;
	}[];
};

type BulkAddItemReviewNextProps = {
	foundItems: BulkReviewFoundItem[];
	reviewItems: BulkReviewNeedsReviewItem[];
	failedResults: BulkFailedResult[];
	selectedReviewItems: Record<string, Item>;
	onSelectReviewCandidate: (line: string, item: Item) => void;
};

type BulkAddItemReviewCompatProps = ComponentProps<typeof BulkAddItemReview> &
	BulkAddItemReviewNextProps;

const BulkAddItemReviewCompat =
	BulkAddItemReview as unknown as ComponentType<BulkAddItemReviewCompatProps>;

const BulkAddItemModal = ({
	cart,
	isVisible,
	initialText,
	onClose,
	addItemsToCart,
}: BulkAddItemModalProps) => {
	const [foundItems, setFoundItems] = useState<BulkReviewFoundItem[]>([]);
	const [reviewItems, setReviewItems] = useState<BulkReviewNeedsReviewItem[]>([]);
	const [selectedReviewItems, setSelectedReviewItems] = useState<Record<string, Item>>({});
	const lastSearchTextRef = useRef('');

	const {
		mutate: findMatchItems,
		data,
		isPending,
		reset: resetMatchItems,
	} = useMatchCatalogItems();

	const cartIds = useMemo(() => new Set(cart.map((cartItem) => cartItem.id)), [cart]);

	const results = useMemo(() => data?.results ?? [], [data]);
	const failedResults = useMemo(() => data?.failedResults ?? [], [data]);
	const selectedReviewItemList = useMemo(
		() => Object.values(selectedReviewItems),
		[selectedReviewItems],
	);
	const addableFoundItems = useMemo(
		() => foundItems.filter(({ item }) => !cartIds.has(item.id)),
		[cartIds, foundItems],
	);
	const addableSelectedReviewItems = useMemo(
		() => selectedReviewItemList.filter((item) => !cartIds.has(item.id)),
		[cartIds, selectedReviewItemList],
	);
	const addableItems = useMemo(
		() => [
			...addableFoundItems.map(({ item }) => item),
			...addableSelectedReviewItems,
		],
		[addableFoundItems, addableSelectedReviewItems],
	);
	const matchedItems = useMemo<BulkReviewMatchedItem[]>(
		() => foundItems.map(({ item }) => ({ item })),
		[foundItems],
	);
	const selectedCount = addableItems.length;
	const remainingCapacity = Math.max(MAX_CART_ITEMS - cart.length, 0);
	const isOverCapacity = selectedCount > remainingCapacity;

	const resetAll = useCallback(() => {
		setFoundItems([]);
		setReviewItems([]);
		setSelectedReviewItems({});
		lastSearchTextRef.current = '';
		resetMatchItems();
	}, [resetMatchItems]);

	const handleClose = useCallback(() => {
		resetAll();
		onClose();
	}, [resetAll, onClose]);

	const handleMatchSuccess = useCallback(
		(matchOutput: BulkMatchOutput) => {
			const nextFoundItems = matchOutput.foundResults.map((result) => ({
				line: result.line,
				item: catalogItemToItem(result.item),
			}));
			const nextReviewItems = matchOutput.needsReviewResults.map((result) => ({
				line: result.line,
				searchTerm: result.searchTerm,
				source: result.source,
				candidates: result.candidates.map((candidate) => ({
					item: catalogItemToItem(candidate.item),
					category: candidate.category,
				})),
			}));

			setFoundItems(nextFoundItems);
			setReviewItems(nextReviewItems);
			setSelectedReviewItems({});

			logBulkAddSearch({
				line_count: matchOutput.results.length,
				found: matchOutput.foundResults.length,
				needs_review: matchOutput.needsReviewResults.length,
				failed: matchOutput.failedResults.length,
			});
		},
		[],
	);

	const searchFromText = useCallback(
		(text: string) => {
			findMatchItems(text, {
				onSuccess: (matchOutput) => {
					handleMatchSuccess(matchOutput);
				},
				onError: () => {
					showToast('error', '아이템 검색에 실패했어요. 다시 시도해주세요.');
					handleClose();
				},
			});
		},
		[handleClose, handleMatchSuccess, findMatchItems],
	);

	useEffect(() => {
		const text = initialText?.trim() ?? '';
		if (!isVisible || !text || lastSearchTextRef.current === text) return;

		lastSearchTextRef.current = text;
		setFoundItems([]);
		setReviewItems([]);
		setSelectedReviewItems({});
		resetMatchItems();
		searchFromText(text);
	}, [initialText, isVisible, resetMatchItems, searchFromText]);

	const handleSelectReviewCandidate = useCallback((line: string, item: Item) => {
		setSelectedReviewItems((prev) => ({ ...prev, [line]: item }));
	}, []);

	const handleConfirm = () => {
		addItemsToCart(addableItems);

		logBulkAddConfirm({
			added: addableItems.length,
			found: addableFoundItems.length,
			selected_review: addableSelectedReviewItems.length,
			skipped_review: reviewItems.length - selectedReviewItemList.length,
			failed: failedResults.length,
		});

		handleClose();
	};

	return (
		<CustomBottomSheet
			bodyStyle={styles.container}
			isVisible={isVisible}
			onClose={handleClose}
			snapPoints={['95%']}
		>
			{isPending ? (
				<View style={styles.loadingContainer}>
					<ThreeDotsLoadingIndicator style={styles.loadingIndicator} />
					<Text style={styles.loadingText}>
						{'붙여넣은 텍스트에서\n아이템을 찾고 있어요…'}
					</Text>
				</View>
			) : (
				<BulkAddItemReviewCompat
					cart={cart}
					results={results}
					matchedItems={matchedItems}
					foundItems={foundItems}
					reviewItems={reviewItems}
					failedResults={failedResults}
					selectedCount={selectedCount}
					isOverCapacity={isOverCapacity}
					selectedReviewItems={selectedReviewItems}
					onManualSearch={() => {}}
					onEditItem={() => {}}
					onSelectReviewCandidate={handleSelectReviewCandidate}
					onConfirm={handleConfirm}
				/>
			)}
		</CustomBottomSheet>
	);
};

export default BulkAddItemModal;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 0,
		paddingBottom: 30,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 24,
		paddingBottom: 72,
	},
	loadingIndicator: {
		width: 132,
	},
	loadingText: {
		fontSize: FontSizes.xl,
		fontWeight: FontWeights.bold,
		lineHeight: LineHeights.xl,
		textAlign: 'center',
		color: Colors.text.primary,
	},
});

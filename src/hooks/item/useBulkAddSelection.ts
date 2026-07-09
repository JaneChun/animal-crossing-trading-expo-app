import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MAX_CART_ITEMS } from '@/constants/post';
import { useMatchCatalogItems } from '@/hooks/item/query/useMatchCatalogItems';
import {
	type BulkMatchOutput,
	type BulkReviewFoundItem,
	type BulkReviewNeedsReviewItem,
} from '@/types/bulkItemMatching';
import { type CartItem, type Item } from '@/types/post';
import { logBulkAddSearch } from '@/utilities/analytics';
import { catalogItemToItem } from '@/utilities/catalogItemToItem';

type UseBulkAddSelectionParams = {
	cart: CartItem[];
	isVisible: boolean;
	initialText?: string;
	onSearchError: () => void;
};

/**
 * 붙여넣기 일괄 추가 모달의 검색·선택 상태를 관리한다.
 * initialText가 들어오면 매칭을 실행하고, 카트 중복을 제외한 추가 가능 아이템을 파생한다.
 */
export const useBulkAddSelection = ({
	cart,
	isVisible,
	initialText,
	onSearchError,
}: UseBulkAddSelectionParams) => {
	const [foundItems, setFoundItems] = useState<BulkReviewFoundItem[]>([]);
	const [reviewItems, setReviewItems] = useState<BulkReviewNeedsReviewItem[]>([]);
	const [selectedReviewItems, setSelectedReviewItems] = useState<Record<string, Item>>({});
	const lastSearchTextRef = useRef('');

	// 검색 실패 콜백은 매 렌더 최신값을 참조하되 검색 트리거 의존성에서는 제외
	const onSearchErrorRef = useRef(onSearchError);
	onSearchErrorRef.current = onSearchError;

	const {
		mutate: findMatchItems,
		data,
		isPending,
		reset: resetMatchItems,
	} = useMatchCatalogItems();

	const cartIds = useMemo(() => new Set(cart.map((cartItem) => cartItem.id)), [cart]);

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
		() => [...addableFoundItems.map(({ item }) => item), ...addableSelectedReviewItems],
		[addableFoundItems, addableSelectedReviewItems],
	);
	const selectedCount = addableItems.length;
	const remainingCapacity = Math.max(MAX_CART_ITEMS - cart.length, 0);
	const isOverCapacity = selectedCount > remainingCapacity;

	const reset = useCallback(() => {
		setFoundItems([]);
		setReviewItems([]);
		setSelectedReviewItems({});
		lastSearchTextRef.current = '';
		resetMatchItems();
	}, [resetMatchItems]);

	const applyMatchOutput = useCallback((matchOutput: BulkMatchOutput) => {
		setFoundItems(
			matchOutput.foundResults.map((result) => ({
				line: result.line,
				item: catalogItemToItem(result.item),
			})),
		);
		setReviewItems(
			matchOutput.needsReviewResults.map((result) => ({
				line: result.line,
				searchTerm: result.searchTerm,
				source: result.source,
				candidates: result.candidates.map((candidate) => ({
					item: catalogItemToItem(candidate.item),
					category: candidate.category,
				})),
			})),
		);
		setSelectedReviewItems({});

		logBulkAddSearch({
			line_count: matchOutput.results.length,
			found: matchOutput.foundResults.length,
			needs_review: matchOutput.needsReviewResults.length,
			failed: matchOutput.failedResults.length,
		});
	}, []);

	const searchFromText = useCallback(
		(text: string) => {
			findMatchItems(text, {
				onSuccess: applyMatchOutput,
				onError: () => {
					reset();
					onSearchErrorRef.current();
				},
			});
		},
		[applyMatchOutput, findMatchItems, reset],
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

	// 후보 선택 토글 — 이미 선택된 후보를 다시 누르면 해당 라인은 선택 해제
	const selectReviewCandidate = useCallback((line: string, item: Item) => {
		setSelectedReviewItems((prev) => {
			if (prev[line]?.id === item.id) {
				const { [line]: _removed, ...rest } = prev;
				return rest;
			}
			return { ...prev, [line]: item };
		});
	}, []);

	return {
		isPending,
		foundItems,
		reviewItems,
		failedResults,
		selectedReviewItems,
		selectedReviewItemList,
		selectedCount,
		isOverCapacity,
		addableItems,
		addableFoundItems,
		addableSelectedReviewItems,
		selectReviewCandidate,
		reset,
	};
};

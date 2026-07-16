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
				// mutate 콜백은 호출별로 각자 응답 도착 시점에 실행되고 취소되지 않으므로,
				// 이전 검색의 늦은 응답이 최신 검색 결과를 덮어쓰지 않도록
				// 콜백 실행 시점의 마지막 검색 텍스트와 대조해 stale 응답을 무시한다
				onSuccess: (matchOutput) => {
					if (lastSearchTextRef.current !== text) return;
					applyMatchOutput(matchOutput);
				},
				// 이전 검색의 늦은 실패가 진행 중인 새 검색의 모달을 닫지 않도록 동일하게 가드
				onError: () => {
					if (lastSearchTextRef.current !== text) return;
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

	// 확정 애널리틱스용 카운트 — 카트 중복 제외 후 실제 처리 결과를 집계
	const getConfirmStats = useCallback(
		() => ({
			added: addableItems.length,
			found: addableFoundItems.length,
			selected_review: addableSelectedReviewItems.length,
			skipped_review: reviewItems.length - selectedReviewItemList.length,
			failed: failedResults.length,
		}),
		[
			addableItems,
			addableFoundItems,
			addableSelectedReviewItems,
			reviewItems,
			selectedReviewItemList,
			failedResults,
		],
	);

	return {
		isPending,
		foundItems,
		reviewItems,
		failedResults,
		selectedReviewItems,
		selectedCount,
		isOverCapacity,
		addableItems,
		selectReviewCandidate,
		getConfirmStats,
		reset,
	};
};

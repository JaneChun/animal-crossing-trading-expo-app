import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MAX_CART_ITEMS } from '@/constants/post';
import { useMatchCatalogItems } from '@/hooks/item/query/useMatchCatalogItems';
import { type BulkMatchOutput } from '@/types/bulkItemMatching';
import { type CatalogItem } from '@/types/catalog';
import { type CartItem } from '@/types/post';
import { logBulkAddSearch } from '@/utilities/analytics';
import { catalogItemToItem } from '@/utilities/catalogItemToItem';

type UseBulkAddSelectionParams = {
	cart: CartItem[];
	isVisible: boolean;
	initialText?: string;
	onSearchError: () => void;
};

// 검색 전/초기화 후에도 파생 useMemo 의존성이 안정적이도록 모듈 레벨 상수로 고정
const EMPTY_MATCH_OUTPUT: BulkMatchOutput = {
	foundResults: [],
	needsReviewResults: [],
	failedResults: [],
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
	const [selectedReviewItems, setSelectedReviewItems] = useState<Record<string, CatalogItem>>(
		{},
	);
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

	// 매칭 결과는 mutation data가 단일 원천
	const { foundResults, needsReviewResults, failedResults } = data ?? EMPTY_MATCH_OUTPUT;

	const selectedReviewItemList = useMemo(
		() => Object.values(selectedReviewItems),
		[selectedReviewItems],
	);
	const addableFoundItems = useMemo(
		() => foundResults.filter(({ item }) => !cartIds.has(item.id)),
		[cartIds, foundResults],
	);
	const addableSelectedReviewItems = useMemo(
		() => selectedReviewItemList.filter((item) => !cartIds.has(item.id)),
		[cartIds, selectedReviewItemList],
	);
	// 확정 직전 단 한 곳에서만 CatalogItem → 카트용 Item으로 변환
	const addableItems = useMemo(
		() =>
			[...addableFoundItems.map(({ item }) => item), ...addableSelectedReviewItems].map(
				catalogItemToItem,
			),
		[addableFoundItems, addableSelectedReviewItems],
	);
	const selectedCount = addableItems.length;
	const remainingCapacity = Math.max(MAX_CART_ITEMS - cart.length, 0);
	const isOverCapacity = selectedCount > remainingCapacity;

	const reset = useCallback(() => {
		setSelectedReviewItems({});
		lastSearchTextRef.current = '';
		resetMatchItems();
	}, [resetMatchItems]);

	const searchFromText = useCallback(
		(text: string) => {
			findMatchItems(text, {
				// mutate 콜백은 호출별로 각자 응답 도착 시점에 실행되고 취소되지 않으므로,
				// 이전 검색의 늦은 응답이 최신 검색 결과를 덮어쓰지 않도록
				// 콜백 실행 시점의 마지막 검색 텍스트와 대조해 stale 응답을 무시한다
				onSuccess: (matchOutput) => {
					if (lastSearchTextRef.current !== text) return;
					setSelectedReviewItems({});

					const found = matchOutput.foundResults.length;
					const needsReview = matchOutput.needsReviewResults.length;
					const failed = matchOutput.failedResults.length;

					logBulkAddSearch({
						line_count: found + needsReview + failed,
						found,
						needs_review: needsReview,
						failed,
					});
				},
				// 이전 검색의 늦은 실패가 진행 중인 새 검색의 모달을 닫지 않도록 동일하게 가드
				onError: () => {
					if (lastSearchTextRef.current !== text) return;
					reset();
					onSearchErrorRef.current();
				},
			});
		},
		[findMatchItems, reset],
	);

	useEffect(() => {
		const text = initialText?.trim() ?? '';
		if (!isVisible || !text || lastSearchTextRef.current === text) return;

		lastSearchTextRef.current = text;
		setSelectedReviewItems({});
		resetMatchItems();
		searchFromText(text);
	}, [initialText, isVisible, resetMatchItems, searchFromText]);

	// 후보 선택 토글 — 이미 선택된 후보를 다시 누르면 해당 라인은 선택 해제
	const selectReviewCandidate = useCallback((line: string, item: CatalogItem) => {
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
			skipped_review: needsReviewResults.length - selectedReviewItemList.length,
			failed: failedResults.length,
		}),
		[
			addableItems,
			addableFoundItems,
			addableSelectedReviewItems,
			needsReviewResults,
			selectedReviewItemList,
			failedResults,
		],
	);

	return {
		isPending,
		foundResults,
		needsReviewResults,
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

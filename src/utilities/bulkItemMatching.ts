import { MAX_REVIEW_CANDIDATES } from '@/constants/post';
import {
	type BulkLineMatchResult,
	type BulkMatchOutput,
	type ClassifyCatalogHitsParams,
	type FailedLineMatchResult,
	type FoundLineMatchResult,
	type NeedsReviewLineMatchResult,
} from '@/types/bulkItemMatching';
import { CatalogItem } from '@/types/catalog';

const REGEX = {
	MULTI_SPACE: /\s+/g,
	TRADING_SUFFIX: /\d+\s*(개|마일|덩|벨)/g,
	SEPARATOR: /\s[-,/|]\s|[-,/|]/,
	PARENTHESES: /\([^)]*\)/g,
};

/**
 * 텍스트의 양끝 공백을 제거하고, 연속된 여러 공백을 단일 공백으로 치환합니다.
 */
export const normalizeItemText = (value: string): string =>
	value.trim().replace(REGEX.MULTI_SPACE, ' ');

/**
 * 거래에서 흔히 쓰이는 접미사와 수량(예: '10개', '5마일')을 텍스트에서 제거합니다.
 */
const stripTradingSuffixes = (value: string): string =>
	normalizeItemText(value.replace(REGEX.TRADING_SUFFIX, ' '));

/**
 * 입력된 텍스트 라인에서 거래 단위나 구분자를 제거하여 검색을 위한 정제된 검색어를 추출합니다.
 * 정제 결과가 비었거나 원문과 같으면(재검색이 무의미하면) null을 반환합니다.
 */
export const buildCleanedSearchTerm = (line: string): string | null => {
	const normalized = normalizeItemText(line);
	const withoutSuffixes = stripTradingSuffixes(normalized);
	const withoutParens = withoutSuffixes.replace(REGEX.PARENTHESES, ' ');
	const itemName = normalizeItemText(withoutParens.split(REGEX.SEPARATOR)[0] ?? '');

	if (!itemName || itemName === normalized) {
		return null;
	}

	return itemName;
};

/**
 * 검색 결과 배열 중에서 이름이 검색어와 완전히 똑같은 항목만 찾아서 반환합니다.
 */
const getExactHits = (searchTerm: string, hits: CatalogItem[]): CatalogItem[] => {
	const normalizedSearchTerm = normalizeItemText(searchTerm);
	return hits.filter((hit) => normalizeItemText(hit.name) === normalizedSearchTerm);
};

/**
 * 한 줄의 검색 결과를 분석하여 완벽 일치(found), 재확인 필요(needsReview), 매칭 실패(failed) 상태로 분류합니다.
 */
export const classifyCatalogHits = ({
	line,
	searchTerm,
	source,
	hits,
}: ClassifyCatalogHitsParams): BulkLineMatchResult => {
	if (hits.length === 0) {
		return { line, status: 'failed' };
	}

	const exactHits = getExactHits(searchTerm, hits);

	const candidates = (exactHits.length > 0 ? exactHits : hits).slice(0, MAX_REVIEW_CANDIDATES);

	// 고를 후보가 하나뿐이면 재확인 없이 완벽 일치(found)로 처리
	if (candidates.length === 1) {
		return { line, status: 'found', item: candidates[0] };
	}

	return {
		line,
		status: 'needsReview',
		searchTerm,
		source,
		candidates,
	};
};

/**
 * 줄 순서로 쌓인 매칭 결과를 상태별 그룹으로 나누고,
 * 동일한 카탈로그 아이템은 첫 번째 찾음 결과만 유지한다.
 */
export const toBulkMatchOutput = (lineResults: BulkLineMatchResult[]): BulkMatchOutput => {
	const foundResults = lineResults.filter(
		(result): result is FoundLineMatchResult => result.status === 'found',
	);
	const needsReviewResults = lineResults.filter(
		(result): result is NeedsReviewLineMatchResult => result.status === 'needsReview',
	);
	const failedResults = lineResults.filter(
		(result): result is FailedLineMatchResult => result.status === 'failed',
	);

	// 찾음 결과에서 중복된 아이템 제거
	const uniqueItemIds = new Set<string>();
	const uniqueFoundResults = foundResults.filter((result) => {
		if (uniqueItemIds.has(result.item.id)) return false;

		uniqueItemIds.add(result.item.id);
		return true;
	});

	return {
		foundResults: uniqueFoundResults,
		needsReviewResults,
		failedResults
	};
};

import { useMutation } from '@tanstack/react-query';

import { searchClient } from '@/config/firebase';
import { HITS_PER_LINE, MAX_ITEM_TEXT_LINES } from '@/constants/post';
import {
	type BulkLineMatchResult,
	type BulkMatchOutput,
	type FailedLineMatchResult,
	type FoundLineMatchResult,
	type NeedsReviewLineMatchResult,
} from '@/types/bulkItemMatching';
import { CatalogItem } from '@/types/catalog';
import { buildCleanedSearchTerms, classifyCatalogHits } from '@/utilities/bulkItemMatching';
import { getTrimmedNonEmptyLines } from '@/utilities/itemTextLines';

/**
 * 사용자가 붙여넣은 전체 텍스트를 검색할 줄 목록으로 정리
 * 호출부 검증과 별개로 Algolia 요청 수 상한을 훅 레벨에서도 보장
 */
const parseSearchLines = (text: string): string[] => {
	const lines = getTrimmedNonEmptyLines(text);

	if (lines.length > MAX_ITEM_TEXT_LINES) {
		throw new Error(`Bulk item matching supports up to ${MAX_ITEM_TEXT_LINES} lines.`);
	}

	return lines;
};

const searchCatalogLine = async (
	line: string,
	searchTerm: string,
	source: 'original' | 'cleaned',
): Promise<BulkLineMatchResult> => {
	const { results } = await searchClient.searchForHits<CatalogItem>({
		requests: [
			{
				indexName: 'CatalogItems',
				query: searchTerm,
				hitsPerPage: HITS_PER_LINE,
				optionalFilters: [`name:${searchTerm}`],
			},
		],
	});

	const hits = (results[0]?.hits ?? []).map((hit) => ({
		...hit,
		id: hit.objectID,
	}));

	return classifyCatalogHits({ line, searchTerm, source, hits });
};

const matchLine = async (line: string): Promise<BulkLineMatchResult> => {
	// 원본 텍스트로 검색
	const originalResult = await searchCatalogLine(line, line, 'original');
	if (originalResult.status !== 'failed') return originalResult;

	// 정제된 검색어로 재시도
	for (const cleanedTerm of buildCleanedSearchTerms(line)) {
		const cleanedResult = await searchCatalogLine(line, cleanedTerm, 'cleaned');
		if (cleanedResult.status !== 'failed') return cleanedResult;
	}

	return { line, status: 'failed' };
};

const matchCatalogItems = async (text: string): Promise<BulkMatchOutput> => {
	const lines = parseSearchLines(text);

	if (lines.length === 0) {
		return { results: [], foundResults: [], needsReviewResults: [], failedResults: [] };
	}

	const lineResults = await Promise.all(lines.map(matchLine));

	return {
		results: lineResults,
		foundResults: lineResults.filter(
			(result): result is FoundLineMatchResult => result.status === 'found',
		),
		needsReviewResults: lineResults.filter(
			(result): result is NeedsReviewLineMatchResult => result.status === 'needsReview',
		),
		failedResults: lineResults.filter(
			(result): result is FailedLineMatchResult => result.status === 'failed',
		),
	};
};

/**
 * 본문에 붙여넣은 여러줄 텍스트를 아이템 검색 결과로 바꾸는 훅
 */
export const useMatchCatalogItems = () => {
	return useMutation({
		mutationFn: matchCatalogItems,
	});
};

import { useMutation } from '@tanstack/react-query';

import { searchClient } from '@/config/firebase';
import { MAX_ITEM_TEXT_LINES } from '@/constants/post';
import { CatalogItem } from '@/types/catalog';
import {
	buildCleanedSearchTerms,
	BulkLineMatchResult,
	classifyCatalogHits,
} from '@/utilities/bulkItemMatching';
import { getTrimmedNonEmptyLines } from '@/utilities/itemTextLines';

export type BulkMatchResult = BulkLineMatchResult;
export type BulkFoundResult = Extract<BulkMatchResult, { status: 'found' }>;
export type BulkNeedsReviewResult = Extract<BulkMatchResult, { status: 'needsReview' }>;
export type BulkFailedResult = Extract<BulkMatchResult, { status: 'failed' }>;

export interface BulkMatchOutput {
	results: BulkMatchResult[];
	foundResults: BulkFoundResult[];
	needsReviewResults: BulkNeedsReviewResult[];
	failedResults: BulkFailedResult[];
}

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

const HITS_PER_LINE = 5;

const searchCatalogLine = async (
	line: string,
	searchTerm: string,
	source: 'original' | 'cleaned',
): Promise<BulkMatchResult> => {
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

const matchLine = async (line: string): Promise<BulkMatchResult> => {
	const originalResult = await searchCatalogLine(line, line, 'original');
	if (originalResult.status !== 'failed') return originalResult;

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
			(result): result is BulkFoundResult => result.status === 'found',
		),
		needsReviewResults: lineResults.filter(
			(result): result is BulkNeedsReviewResult => result.status === 'needsReview',
		),
		failedResults: lineResults.filter(
			(result): result is BulkFailedResult => result.status === 'failed',
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

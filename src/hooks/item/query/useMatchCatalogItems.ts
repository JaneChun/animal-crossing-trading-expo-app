import { useMutation } from '@tanstack/react-query';

import { searchClient } from '@/config/firebase';
import { HITS_PER_LINE, MAX_ITEM_TEXT_LINES, MAX_MULTI_QUERY_SIZE } from '@/constants/post';
import {
	type BulkLineMatchResult,
	type BulkMatchOutput,
	type FailedLineMatchResult,
	type FoundLineMatchResult,
	type LineSearchRequest,
	type NeedsReviewLineMatchResult,
} from '@/types/bulkItemMatching';
import { CatalogItem } from '@/types/catalog';
import { buildCleanedSearchTerms, classifyCatalogHits } from '@/utilities/bulkItemMatching';
import { chunkArray } from '@/utilities/chunkArray';
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

/**
 * 여러 줄의 검색 요청을 Algolia 멀티쿼리로 묶어 실행한다.
 * 요청당 상한(MAX_MULTI_QUERY_SIZE)만큼 청킹해 청크별로 한 번씩 요청하고,
 * 각 응답을 요청 index와 짝지어 분류 결과로 돌려준다.
 */
const runSearchRequests = async (
	requests: LineSearchRequest[],
): Promise<{ index: number; result: BulkLineMatchResult }[]> => {
	if (requests.length === 0) return [];

	const chunks = chunkArray(requests, MAX_MULTI_QUERY_SIZE);

	const chunkResults = await Promise.all(
		chunks.map(async (chunk) => {
			const { results } = await searchClient.searchForHits<CatalogItem>({
				requests: chunk.map((request) => ({
					indexName: 'CatalogItems',
					query: request.searchTerm,
					hitsPerPage: HITS_PER_LINE,
					optionalFilters: [`name:${request.searchTerm}`],
				})),
			});

			return chunk.map((request, i) => {
				const hits = (results[i]?.hits ?? []).map((hit) => ({
					...hit,
					id: hit.objectID,
				}));

				return {
					index: request.index,
					result: classifyCatalogHits({
						line: request.line,
						searchTerm: request.searchTerm,
						source: request.source,
						hits,
					}),
				};
			});
		}),
	);

	return chunkResults.flat();
};

const matchCatalogItems = async (text: string): Promise<BulkMatchOutput> => {
	const lines = parseSearchLines(text);

	if (lines.length === 0) {
		return { results: [], foundResults: [], needsReviewResults: [], failedResults: [] };
	}

	// 줄 순서를 유지한 결과 배열 (기본값은 실패)
	const lineResults: BulkLineMatchResult[] = lines.map((line) => ({
		line,
		status: 'failed',
	}));

	// 1) 모든 줄을 원문으로 일괄 검색
	const originalRequests: LineSearchRequest[] = lines.map((line, index) => ({
		index,
		line,
		searchTerm: line,
		source: 'original',
	}));
	const originalResponses = await runSearchRequests(originalRequests);
	originalResponses.forEach(({ index, result }) => {
		lineResults[index] = result;
	});

	// 2) 실패한 줄만 정제된 검색어로 일괄 재검색
	//    (buildCleanedSearchTerms는 최대 1개의 검색어만 돌려준다)
	const cleanedRequests: LineSearchRequest[] = [];
	lineResults.forEach((result, index) => {
		if (result.status !== 'failed') return;

		const [cleanedTerm] = buildCleanedSearchTerms(lines[index]);
		if (cleanedTerm) {
			cleanedRequests.push({
				index,
				line: lines[index],
				searchTerm: cleanedTerm,
				source: 'cleaned',
			});
		}
	});

	const cleanedResponses = await runSearchRequests(cleanedRequests);
	cleanedResponses.forEach(({ index, result }) => {
		if (result.status !== 'failed') {
			lineResults[index] = result;
		}
	});

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

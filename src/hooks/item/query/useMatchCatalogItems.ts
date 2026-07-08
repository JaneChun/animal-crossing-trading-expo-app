import { useMutation } from '@tanstack/react-query';

import { searchClient } from '@/config/firebase';
import { CatalogItem } from '@/types/catalog';
import { getTrimmedNonEmptyLines } from '@/utilities/itemTextLines';

export type BulkMatchResult =
	| { line: string; status: 'matched'; item: CatalogItem }
	| { line: string; status: 'failed' };

export interface BulkMatchOutput {
	results: BulkMatchResult[];
}

/**
 * 사용자가 붙여넣은 전체 텍스트를 검색할 줄 목록으로 정리
 */
const parseSearchLines = (text: string): string[] => [...new Set(getTrimmedNonEmptyLines(text))];

/**
 * Algolia 검색 결과를 바탕으로 matched/failed 분류
 */
const classifyLine = (line: string, hits: CatalogItem[]): BulkMatchResult => {
	const [firstHit] = hits; // 검색 결과 중 첫 번째 아이템만 사용
	return firstHit ? { line, status: 'matched', item: firstHit } : { line, status: 'failed' };
};

const matchCatalogItems = async (text: string): Promise<BulkMatchOutput> => {
	const lines = parseSearchLines(text);

	if (lines.length === 0) {
		return { results: [] };
	}

	// searchForHits로 여러 줄을 한 번에 검색
	const { results } = await searchClient.searchForHits<CatalogItem>({
		requests: lines.map((line) => ({
			indexName: 'CatalogItems',
			query: line,
			hitsPerPage: 1, // 각 줄마다 첫 번째 결과만 받음
		})),
	});

	// hits 추출 + objectID를 id로 매핑 + matched/failed 분류
	const lineResults = lines.map((line, index) => {
		const hits = (results[index]?.hits ?? []).map((hit) => ({
			...hit,
			id: hit.objectID,
		}));

		return classifyLine(line, hits);
	});

	return { results: lineResults };
};

/**
 * 본문에 붙여넣은 여러줄 텍스트를 아이템 검색 결과로 바꾸는 훅
 */
export const useMatchCatalogItems = () => {
	return useMutation({
		mutationFn: matchCatalogItems,
	});
};

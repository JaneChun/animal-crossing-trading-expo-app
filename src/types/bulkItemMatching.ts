import { type CatalogItem } from './catalog';

// ── 매칭 결과 (붙여넣은 라인 → Algolia 검색 → 라인별 분류) ──

export type MatchSource = 'original' | 'cleaned';

// 원문 라인이 정확히 하나로 확정된 항목
export type FoundLineMatchResult = {
	line: string;
	status: 'found';
	item: CatalogItem;
};

// 후보가 여러 개라 사용자가 골라야 하는 라인
export type NeedsReviewLineMatchResult = {
	line: string;
	status: 'needsReview';
	searchTerm: string;
	source: MatchSource;
	candidates: CatalogItem[];
};

// 어떤 검색으로도 매칭하지 못한 라인
export type FailedLineMatchResult = {
	line: string;
	status: 'failed';
};

export type BulkLineMatchResult =
	FoundLineMatchResult | NeedsReviewLineMatchResult | FailedLineMatchResult;

// 전체 텍스트 매칭 결과를 상태별로 나눈 형태
// 찾은 결과는 카탈로그 ID 기준 첫 항목만, 나머지 결과는 라인별로 유지한다
export type BulkMatchOutput = {
	foundResults: FoundLineMatchResult[];
	needsReviewResults: NeedsReviewLineMatchResult[];
	failedResults: FailedLineMatchResult[];
};

export type ClassifyCatalogHitsParams = {
	line: string;
	searchTerm: string;
	source: MatchSource;
	hits: CatalogItem[];
};

// 한 줄에 대한 검색 요청 (멀티쿼리 응답을 원래 줄 위치로 되돌리기 위해 index 유지)
export type LineSearchRequest = {
	index: number;
	line: string;
	searchTerm: string;
	source: MatchSource;
};

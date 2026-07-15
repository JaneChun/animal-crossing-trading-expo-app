import { type CatalogItem } from './catalog';
import { type Item } from './post';

// ── 매칭 결과 (붙여넣은 라인 → Algolia 검색 → 라인별 분류) ──

export type MatchSource = 'original' | 'cleaned';

// 재확인 시트에 노출하는 후보 하나 (원본 CatalogItem 포함)
export type CatalogItemCandidate = {
	id: string;
	name: string;
	category: string;
	imageUrl: string;
	item: CatalogItem;
};

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
	candidates: CatalogItemCandidate[];
};

// 어떤 검색으로도 매칭하지 못한 라인
export type FailedLineMatchResult = {
	line: string;
	status: 'failed';
};

export type BulkLineMatchResult =
	FoundLineMatchResult | NeedsReviewLineMatchResult | FailedLineMatchResult;

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

// 전체 텍스트 매칭 결과를 상태별로 나눈 형태
export type BulkMatchOutput = {
	results: BulkLineMatchResult[];
	foundResults: FoundLineMatchResult[];
	needsReviewResults: NeedsReviewLineMatchResult[];
	failedResults: FailedLineMatchResult[];
};

// ── 리뷰 뷰모델 (매칭 결과의 CatalogItem을 카트용 Item으로 변환한 형태) ──

// 찾은 아이템 — 원문 라인이 정확히 하나로 확정된 항목
export type BulkReviewFoundItem = {
	line: string;
	item: Item;
};

// 확인할 아이템의 후보 하나
export type BulkReviewCandidate = {
	item: Item;
	category: string;
};

// 확인할 아이템 — 후보가 여러 개라 사용자가 선택해야 하는 라인
export type BulkReviewNeedsReviewItem = {
	line: string;
	searchTerm: string;
	source: MatchSource;
	candidates: BulkReviewCandidate[];
};

import { type MatchSource } from '@/utilities/bulkItemMatching';

import { type Item } from './post';

// 붙여넣기 리뷰 시트에서 사용하는 뷰모델 타입
// (매칭 결과 CatalogItem을 카트용 Item으로 변환한 형태)

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

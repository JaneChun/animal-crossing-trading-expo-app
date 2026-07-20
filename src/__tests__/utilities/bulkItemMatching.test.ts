import { BulkLineMatchResult } from '@/types/bulkItemMatching';
import { CatalogItem } from '@/types/catalog';
import {
	buildCleanedSearchTerm,
	classifyCatalogHits,
	normalizeItemText,
	toBulkMatchOutput,
} from '@/utilities/bulkItemMatching';

const catalogItem = (overrides: Partial<CatalogItem> & { id: string; name: string }) =>
	({
		objectID: overrides.id,
		id: overrides.id,
		name: overrides.name,
		category: overrides.category ?? 'Housewares',
		imageUrl: overrides.imageUrl ?? 'https://example.com/item.png',
		bodyTitle: null,
		patternTitle: null,
		attributes: {},
	}) as unknown as CatalogItem;

describe('bulkItemMatching', () => {
	it('붙어 있는 한국어 아이템 텍스트를 정규화한다', () => {
		expect(normalizeItemText('  생선건조대   ')).toBe('생선건조대');
		expect(normalizeItemText('생선 건조대')).toBe('생선 건조대');
	});

	it('거래 목록 접미사를 제거한 검색어를 만든다', () => {
		expect(buildCleanedSearchTerm('생선건조대 (물고기) 1개 - 25마일')).toBe('생선건조대');
		expect(buildCleanedSearchTerm('물고기컨테이너 (오렌지) 1개 - 1마일')).toBe('물고기컨테이너');
		expect(buildCleanedSearchTerm('페인트통 (세피아 컬러) 1개 - 1마일')).toBe('페인트통');
	});

	it('정제 후 새 검색어가 없으면 null을 반환한다', () => {
		expect(buildCleanedSearchTerm('사과 의자')).toBeNull();
		expect(buildCleanedSearchTerm('')).toBeNull();
	});

	it('원본 검색어와 정확히 일치하는 유일한 항목을 찾음으로 분류한다', () => {
		const result = classifyCatalogHits({
			line: '사과 의자',
			searchTerm: '사과 의자',
			source: 'original',
			hits: [catalogItem({ id: 'apple-chair', name: '사과 의자' })],
		});

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.item.id).toBe('apple-chair');
		}
	});

	it('원본 검색어와 정확히 일치하는 중복 항목을 검토 필요로 분류한다', () => {
		const result = classifyCatalogHits({
			line: '대나무 깜짝 상자',
			searchTerm: '대나무 깜짝 상자',
			source: 'original',
			hits: [
				catalogItem({ id: 'bamboo-box', name: '대나무 깜짝 상자', category: 'Housewares' }),
				catalogItem({
					id: 'bamboo-box-recipe',
					name: '대나무 깜짝 상자',
					category: 'Recipes',
				}),
			],
		});

		expect(result.status).toBe('needsReview');
		if (result.status === 'needsReview') {
			expect(result.candidates.map((candidate) => candidate.id)).toEqual([
				'bamboo-box',
				'bamboo-box-recipe',
			]);
		}
	});

	it('정제된 검색어의 단일 후보를 찾음으로 분류한다', () => {
		const result = classifyCatalogHits({
			line: '요트 (대미지) 1개 - 5마일',
			searchTerm: '요트',
			source: 'cleaned',
			hits: [catalogItem({ id: 'yacht', name: '요트' })],
		});

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.item.id).toBe('yacht');
		}
	});

	it('정확히 일치하지 않는 단일 결과를 찾음으로 분류한다', () => {
		const result = classifyCatalogHits({
			line: '사과의자',
			searchTerm: '사과의자',
			source: 'original',
			hits: [catalogItem({ id: 'apple-chair', name: '사과 의자' })],
		});

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.item.id).toBe('apple-chair');
		}
	});

	it('검색 결과가 없으면 실패로 분류한다', () => {
		const result = classifyCatalogHits({
			line: '없는 아이템',
			searchTerm: '없는 아이템',
			source: 'original',
			hits: [],
		});

		expect(result).toEqual({ line: '없는 아이템', status: 'failed' });
	});

	it('서로 다른 입력 줄이 동일한 아이템으로 검색되면 첫 결과만 유지한다', () => {
		const yacht = catalogItem({ id: 'yacht', name: '요트' });
		const lineResults: BulkLineMatchResult[] = [
			{ line: '요트', status: 'found', item: yacht },
			{ line: '요트 1개', status: 'found', item: yacht },
			{ line: '요트 3마일', status: 'found', item: yacht },
		];

		const result = toBulkMatchOutput(lineResults);

		expect(result.foundResults).toEqual([lineResults[0]]);
	});

	it('이름이 같아도 카탈로그 ID가 다른 아이템은 모두 유지한다', () => {
		const item = catalogItem({ id: 'bamboo-box', name: '대나무 깜짝 상자' });
		const recipe = catalogItem({
			id: 'bamboo-box-recipe',
			name: '대나무 깜짝 상자',
			category: 'Recipes',
		});
		const lineResults: BulkLineMatchResult[] = [
			{ line: '대나무 깜짝 상자', status: 'found', item },
			{ line: '대나무 깜짝 상자 레시피', status: 'found', item: recipe },
		];

		const result = toBulkMatchOutput(lineResults);

		expect(result.foundResults).toEqual(lineResults);
	});

	it('검토 필요와 실패 결과는 입력 라인별로 유지한다', () => {
		const candidate = catalogItem({ id: 'apple-chair', name: '사과 의자' });
		const needsReviewResult: BulkLineMatchResult = {
			line: '사과의자',
			status: 'needsReview',
			searchTerm: '사과의자',
			source: 'original',
			candidates: [candidate],
		};
		const failedResult: BulkLineMatchResult = { line: '없는 아이템', status: 'failed' };

		const result = toBulkMatchOutput([needsReviewResult, failedResult]);

		expect(result.needsReviewResults).toEqual([needsReviewResult]);
		expect(result.failedResults).toEqual([failedResult]);
	});
});

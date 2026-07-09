import { CatalogItem } from '@/types/catalog';
import {
	buildCleanedSearchTerms,
	classifyCatalogHits,
	normalizeItemText,
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
	it('normalizes compact Korean item text', () => {
		expect(normalizeItemText('  생선건조대   ')).toBe('생선건조대');
		expect(normalizeItemText('생선 건조대')).toBe('생선 건조대');
	});

	it('builds cleaned terms from trading-list suffixes', () => {
		expect(buildCleanedSearchTerms('생선건조대 (물고기) 1개 - 25마일')).toEqual(['생선건조대']);
		expect(buildCleanedSearchTerms('물고기컨테이너 (오렌지) 1개 - 1마일')).toEqual([
			'물고기컨테이너',
		]);
		expect(buildCleanedSearchTerms('페인트통 (세피아 컬러) 1개 - 1마일')).toEqual(['페인트통']);
	});

	it('classifies a unique original exact match as found', () => {
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

	it('classifies duplicate original exact matches as needsReview', () => {
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

	it('classifies a single cleaned candidate as found', () => {
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

	it('classifies a single non-exact hit as found', () => {
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

	it('classifies empty hits as failed', () => {
		const result = classifyCatalogHits({
			line: '없는 아이템',
			searchTerm: '없는 아이템',
			source: 'original',
			hits: [],
		});

		expect(result).toEqual({ line: '없는 아이템', status: 'failed' });
	});
});

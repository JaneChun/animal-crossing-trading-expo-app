import { CatalogItem } from '@/types/catalog';
import {
	catalogItemToBulkAddItem,
	getBulkAddCartId,
	getUniqueBulkAddCatalogItems,
} from '@/utilities/catalogItemToItem';

const catalogItem = (overrides: Partial<CatalogItem> & { id: string; name: string }) =>
	({
		objectID: overrides.id,
		category: 'Housewares',
		imageUrl: 'https://example.com/item.png',
		bodyTitle: null,
		patternTitle: null,
		attributes: {},
		...overrides,
	}) as unknown as CatalogItem;

describe('getBulkAddCartId', () => {
	it('변형이 없는 아이템은 원본 id를 반환한다', () => {
		expect(getBulkAddCartId(catalogItem({ id: 'apple-chair', name: '사과 의자' }))).toBe(
			'apple-chair',
		);
	});

	it('bodyTitle이 있는 아이템은 _any 접미사 id를 반환한다', () => {
		expect(
			getBulkAddCartId(catalogItem({ id: 'paint-can', name: '페인트통', bodyTitle: '컬러' })),
		).toBe('paint-can_any');
	});

	it('patternTitle만 있는 아이템도 _any 접미사 id를 반환한다', () => {
		expect(
			getBulkAddCartId(
				catalogItem({ id: 'wooden-sofa', name: '나무 소파', patternTitle: '패턴' }),
			),
		).toBe('wooden-sofa_any');
	});
});

describe('catalogItemToBulkAddItem', () => {
	it('변형이 없는 아이템은 catalogItemToItem과 동일하게 부모 id 그대로 변환한다', () => {
		const item = catalogItemToBulkAddItem(
			catalogItem({ id: 'apple-chair', name: '사과 의자' }),
		);

		expect(item).toEqual({
			id: 'apple-chair',
			category: 'Housewares',
			imageUrl: 'https://example.com/item.png',
			name: '사과 의자',
		});
	});

	it('변형이 있는 아이템은 색상 무관 형태(_any id)로 변환하고 부모 이미지를 사용한다', () => {
		const item = catalogItemToBulkAddItem(
			catalogItem({
				id: 'paint-can',
				name: '페인트통',
				bodyTitle: '컬러',
				imageUrl: 'https://example.com/paint-can.png',
			}),
		);

		expect(item).toEqual({
			id: 'paint-can_any',
			category: 'Housewares',
			imageUrl: 'https://example.com/paint-can.png',
			name: '페인트통',
			color: '색상 무관',
		});
	});
});

describe('getUniqueBulkAddCatalogItems', () => {
	it('기존 카트에 있는 아이템과 같은 id를 가진 아이템을 제외한다', () => {
		const paintCan = catalogItem({
			id: 'paint-can',
			name: '페인트통',
			bodyTitle: '컬러',
		});
		const appleChair = catalogItem({ id: 'apple-chair', name: '사과 의자' });
		const existingCartIds = new Set(['paint-can_any']);

		const result = getUniqueBulkAddCatalogItems(
			[paintCan, appleChair],
			existingCartIds,
		);

		expect(result).toEqual([appleChair]);
	});

	it('입력 목록에서 같은 카트 id가 중복되면 첫 번째 아이템만 유지한다', () => {
		const firstAppleChair = catalogItem({
			id: 'apple-chair',
			name: '사과 의자',
			imageUrl: 'https://example.com/first.png',
		});
		const duplicateAppleChair = catalogItem({
			id: 'apple-chair',
			name: '사과 의자',
			imageUrl: 'https://example.com/duplicate.png',
		});

		const result = getUniqueBulkAddCatalogItems([firstAppleChair, duplicateAppleChair]);

		expect(result).toEqual([firstAppleChair]);
	});
});

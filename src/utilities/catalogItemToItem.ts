import { isArtworkWithFake } from '@/constants/post';
import { CatalogItem, CatalogVariant } from '@/types/catalog';
import { Item } from '@/types/post';

export const ANY_VARIANT_LABEL = '색상 무관';

/**
 * 변형(body/pattern) 보유 여부
 */
export const hasCatalogItemVariants = (item: CatalogItem): boolean =>
	!!(item.bodyTitle || item.patternTitle);

/**
 * 아이템 목록의 보조 설명 문자열 — 미술품은 진품/가품, 레시피는 '레시피'를 반환한다.
 */
export const getCatalogItemDescription = (item: CatalogItem): string | undefined => {
	if (item.category === 'Artwork' && isArtworkWithFake(item)) {
		const genuine = item.attributes.genuine;
		if (genuine === 'Yes') return '진품';
		if (genuine === 'No') return '가품';
	}
	if (item.category === 'Recipes') return '레시피';
	return undefined;
};

/**
 * 변형이 없는 CatalogItem을 카트용 Item으로 변환한다.
 * 미술품/레시피처럼 variant 없이 보조 설명이 필요한 아이템은 color에 표시용 문자열을 담는다.
 */
export const catalogItemToItem = (item: CatalogItem): Item => {
	const description = getCatalogItemDescription(item);

	return {
		id: item.id,
		category: item.category,
		imageUrl: item.imageUrl,
		name: item.name,
		...(description && { color: description }),
	};
};

/**
 * 변형이 있는 CatalogItem, CatalogVariant을 카트용 Item으로 변환한다.
 * body/pattern 값을 문자열로 변환해 아이템의 보조 설명(color)에 표시한다.
 */
export const catalogVariantToItem = (item: CatalogItem, variant: CatalogVariant): Item => {
	const variantTokens = [variant.body, variant.pattern].filter(Boolean);
	const color = variantTokens.length > 0 ? variantTokens.join(', ') : undefined;

	return {
		id: variant.id,
		category: item.category,
		imageUrl: variant.imageUrl,
		name: item.name,
		...(color && { color }),
	};
};

/**
 * "색상 무관" 합성 variant를 생성한다 — `_any` id와 라벨 규칙의 단일 원천.
 * 일괄 추가 — 부모 이미지 사용 (변형 서브컬렉션 조회 없이 사용)
 * 변형 선택 모달(ItemVariantSelect) — 0_0 변형 이미지 사용
 */
export const createAnyVariant = (item: CatalogItem, imageUrl: string): CatalogVariant => ({
	id: `${item.id}_any`,
	variantId: '0_0',
	body: ANY_VARIANT_LABEL,
	pattern: null,
	imageUrl,
});

/**
 * 일괄 추가용 변환 — 일괄 추가는 변형 선택 없이 담기므로, 변형이 있는 아이템은
 * AddItemModal의 "색상 무관" 선택과 동일한 형태(`${item.id}_any`, color: '색상 무관')로
 * 변환해 카트 id 체계를 통일한다.
 */
export const catalogItemToBulkAddItem = (item: CatalogItem): Item => {
	if (!hasCatalogItemVariants(item)) return catalogItemToItem(item);

	const anyVariant = createAnyVariant(item, item.imageUrl);

	return catalogVariantToItem(item, anyVariant);
};

/**
 * CatalogItem이 일괄 추가로 카트에 담길 때의 id — 카트 중복 판정에 사용.
 * 변환 결과에서 파생시켜 실제로 담기는 id와 항상 일치함을 보장한다.
 */
export const getBulkAddCartId = (item: CatalogItem): string => catalogItemToBulkAddItem(item).id;

/**
 * 일괄 추가 후보에서 이미 카트에 담긴 아이템 제거
 */
export const getUniqueBulkAddCatalogItems = (
	items: CatalogItem[],
	existingCartIds: ReadonlySet<string> = new Set(),
): CatalogItem[] => {
	const seenCartIds = new Set(existingCartIds);

	return items.filter((item) => {
		const cartId = getBulkAddCartId(item);
		if (seenCartIds.has(cartId)) return false;

		seenCartIds.add(cartId);
		return true;
	});
};

/**
 * 아이템 선택 창(ItemSelect 모달)에서만 사용
 * — 미술품과 레시피에 한해서만 아이템 이름을 거룩한 조각 (진품), 거룩한 조각 (가품), 복숭아 벽지 (레시피)로 표시
 */
export const getCatalogItemDisplayName = (item: CatalogItem): string => {
	const description = getCatalogItemDescription(item);
	return description ? `${item.name} (${description})` : item.name;
};

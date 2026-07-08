import { isArtworkWithFake } from '@/constants/post';
import { CatalogItem, CatalogVariant } from '@/types/catalog';
import { Item } from '@/types/post';

const getItemDescription = (item: CatalogItem): string | undefined => {
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
	const description = getItemDescription(item);

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
 * body/pattern 값은 아이템 목록의 보조 설명(color)에 표시된다.
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
 * 아이템 선택 창(ItemSelect 모달)에서만 사용
 * — 미술품과 레시피에 한해서만 아이템 이름을 거룩한 조각 (진품), 거룩한 조각 (가품), 복숭아 벽지 (레시피)로 표시
 */
export const getCatalogItemDisplayName = (item: CatalogItem): string => {
	const description = getItemDescription(item);
	return description ? `${item.name} (${description})` : item.name;
};

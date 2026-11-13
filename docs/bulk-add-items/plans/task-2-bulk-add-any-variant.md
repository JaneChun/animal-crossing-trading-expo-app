# Task 2 — 일괄 추가: 변형 보유 아이템을 "색상 무관"(`_any`)으로 통일

> **실행 순서**: Task 1 → Task 3 → **Task 2** 권장. Task 3(타입 단순화)이 CatalogItem→Item 변환 지점을 `useBulkAddSelection.addableItems` 한 곳으로 모아주므로, 이 작업의 변환 분기를 그 지점에 얹으면 됨. Task 3을 건너뛰고 실행한다면 "구현 위치 — Task 3 미적용 시" 섹션 참조.
> **브랜치**: `feat/bulk-add-items`

## 배경 — 현재 카트 id 체계 (AddItemModal 단건 추가 기준)

| 케이스 | id | color | 근거 코드 |
|--------|----|----|-----------|
| 변형 없는 아이템 | `CatalogItem.id` (부모) | 카테고리별 설명(진품/가품/레시피) 또는 없음 | `catalogItemToItem` (`src/utilities/catalogItemToItem.ts`) |
| 변형 있는 아이템 — 특정 변형 선택 | `variant.id` | `"레드"` 등 body/pattern 조합 | `catalogVariantToItem` |
| 변형 있는 아이템 — **"색상 무관" 선택** | **`${item.id}_any`** | `'색상 무관'` | `ItemVariantSelect.tsx:28-37`의 합성 variant |

`ItemVariantSelect`는 `bodyTitle`이 있는 아이템의 변형 목록 맨 앞에 합성 옵션을 끼워넣는다:

```ts
{
	id: `${item.id}_any`,
	variantId: '0_0',
	body: '색상 무관',
	pattern: null,
	imageUrl: firstVariant.imageUrl, // 0_0 변형의 이미지
}
```

## 문제

일괄 추가 파이프라인은 매칭된 `CatalogItem`을 `catalogItemToItem`으로 **무조건 부모 id 그대로** 변환한다. 변형 보유 여부(`bodyTitle || patternTitle`)를 확인하지 않음.

- 카트 id가 이원화됨: 단건 추가는 `variant.id`/`${item.id}_any`, 일괄 추가는 부모 `item.id`.
- 같은 아이템인데 id가 달라 "이미 담김" 중복 감지가 플로우 간에 동작하지 않음 → 카트에 사실상 같은 아이템이 2개 들어감.

## 결정 사항 (사용자 확정)

- 일괄 추가에서 **변형 보유 아이템(`bodyTitle || patternTitle`)은 `id: ${item.id}_any`, `color: '색상 무관'`으로 변환**한다. AddItemModal의 "색상 무관" 선택과 동일한 데이터.
- `patternTitle`만 있는 아이템(AddItemModal에는 색상 무관 옵션이 없는 케이스)도 **동일하게 `_any`로 통일**한다.
- 이미지는 변형 서브컬렉션을 조회하지 않고 **부모 `CatalogItem.imageUrl`** 사용 (id가 합성 문자열이므로 Firestore read 0회). AddItemModal의 색상 무관은 `0_0` 변형 이미지를 쓰는데, 데이터상 부모 이미지와 거의 동일할 것으로 예상 — 눈에 띄게 다른 아이템이 발견되면 별도 논의.

## 구현

`src/utilities/catalogItemToItem.ts`에 변환 함수 추가:

```ts
/**
 * 일괄 추가용 변환 — 변형이 있는 아이템은 AddItemModal의 "색상 무관" 선택과
 * 동일한 형태(`${item.id}_any`, color: '색상 무관')로 변환해 카트 id 체계를 통일한다.
 * (ItemVariantSelect.tsx의 합성 variant와 같은 id 규칙)
 */
export const catalogItemToAnyVariantItem = (item: CatalogItem): Item => {
	const hasVariants = !!(item.bodyTitle || item.patternTitle);
	if (!hasVariants) return catalogItemToItem(item);

	return {
		id: `${item.id}_any`,
		category: item.category,
		imageUrl: item.imageUrl,
		name: item.name,
		color: '색상 무관',
	};
};
```

- **Task 3 적용 후**: `useBulkAddSelection`의 `addableItems` 계산부(CatalogItem→Item 변환 지점)에서 `catalogItemToItem` 대신 `catalogItemToAnyVariantItem` 호출.
- **Task 3 미적용 시**: `useBulkAddSelection.applyMatchOutput`의 `catalogItemToItem(result.item)`·`catalogItemToItem(candidate.item)` 두 곳을 교체.
- 단건 추가 경로(`ItemSelect.handleSelect`)는 건드리지 않는다 — 변형 있는 아이템은 애초에 `catalogItemToItem`을 타지 않고 변형 선택 화면으로 간다.

### 중복 감지 주의점

리뷰 화면의 "이미 담김" 판정(`cartIds.has(item.id)`)이 변환 **후** id(`_any`) 기준으로 이루어져야 AddItemModal에서 색상 무관으로 담은 아이템과 매칭된다. 변환 전 `CatalogItem.id`로 비교하는 코드가 남아 있으면 안 됨 (Task 3 구조에서는 비교 시점에 변환 후 id를 쓰도록 확인).

## 알려진 한계 (수용됨)

- 특정 변형(예: 레드)을 단건 추가로 담아둔 상태에서 일괄 추가로 같은 아이템이 매칭되면, id가 `variant.id` vs `_any`로 달라 중복 감지가 안 됨. "색상 무관"과 "레드"는 단건 플로우에서도 별개 항목으로 공존 가능하므로 의도된 동작.

## 검증

```bash
npm run typecheck
npx jest --selectProjects unit
```

수동 확인:
1. AddItemModal에서 변형 있는 아이템을 "색상 무관"으로 카트에 추가 → 같은 아이템이 매칭되는 텍스트를 일괄 추가 → 리뷰 화면에 "이미 담김"으로 표시되는지.
2. 변형 있는 아이템을 일괄 추가로만 담기 → 카트 항목의 color가 '색상 무관', id가 `_any` 접미사인지 (게시글 작성까지 정상 동작).

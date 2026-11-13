# Task 1 — 일괄 추가: 카트 추가 시 id 중복 제거

> **실행 순서**: Task 1 → Task 3 → Task 2 권장. 이 작업은 다른 작업과 독립적이라 먼저 단독 실행 가능.
> **브랜치**: `feat/bulk-add-items`

## 배경

'아이템 일괄 추가' 기능(본문에 거래 목록 붙여넣기 → Algolia 매칭 → 카트에 일괄 추가)의 코드리뷰에서 발견된 버그.

- 붙여넣은 텍스트에서 **서로 다른 라인이 같은 아이템으로 매칭**될 수 있다 (예: `사과 의자`와 `사과의자 1개 - 5마일`).
- 또한 found 아이템과 사용자가 재확인(needsReview) 섹션에서 고른 후보가 같은 아이템일 수 있다.
- 이 경우 `useBulkAddSelection`의 `addableItems` 배열에 **동일 id가 2개 이상** 포함된다.
- `useCartState.addItems`의 현재 필터는 **기존 카트와의 중복만** 거른다 (`!cartIds.has(item.id)`). 배열 내부 중복은 통과 → 카트에 동일 id `CartItem`이 2개 생성됨.
- 결과: `ItemList`의 `key={item.id}` React 키 충돌, `deleteItem`은 둘 다 삭제, `updateItem`은 둘 다 수정되는 오동작.

## 결정 사항 (사용자 확정)

- 중복 제거는 **`cartState.addItems`에서 처리**한다. (매칭 레이어 `useMatchCatalogItems`나 `useBulkAddSelection`이 아니라)

## 구현

파일: `src/hooks/post/form/useCartState.ts` — `addItems` 함수 (약 95~127행)

현재 코드:

```ts
const cart = getValues('cart') ?? [];
const cartIds = new Set(cart.map((cartItem) => cartItem.id));
const newItems = items.filter((item) => !cartIds.has(item.id));
```

변경 (단일 패스로 카트 중복 + 배열 내부 중복 동시 제거):

```ts
const cart = getValues('cart') ?? [];
const cartIds = new Set(cart.map((cartItem) => cartItem.id));
// 카트에 이미 있는 아이템뿐 아니라 items 내부의 중복도 제거
// (같은 아이템이 여러 줄로 매칭되면 addableItems에 동일 id가 2개 이상 들어올 수 있음)
const newItems = items.filter((item) => {
	if (cartIds.has(item.id)) return false;
	cartIds.add(item.id);
	return true;
});
```

## 알려진 한계 (수용됨)

- 확정 버튼의 "N개 추가하기" 카운트(`selectedCount`)는 dedup 전 개수라, 내부 중복이 있으면 버튼은 2개라고 표시되지만 실제로는 1개만 추가되고 토스트에 "(1개 제외)"로 안내됨. 사용자가 이 동작을 수용함.
- 카탈로그에는 같은 이름의 레코드가 아이템/레시피로 따로 존재할 수 있음 (예: `배 러그` → Rugs `hLakk5wPNF2RHRCHR`, Recipes `eEcepcMqPiijQzjta`). id 기반 dedup은 이 둘을 별개 아이템으로 취급하며, 이는 의도된 동작 — 레시피 후보는 UI에 `배 러그 (레시피)`로 구분 표시됨.

## 검증

```bash
npm run typecheck
npx jest --selectProjects unit
```

수동 확인: NewPost 본문에 같은 아이템이 두 줄로 매칭되는 텍스트(예: `사과 의자` / `사과의자 1개`)를 붙여넣고 일괄 추가 → 카트에 1개만 추가되고 토스트에 제외 안내가 뜨는지.

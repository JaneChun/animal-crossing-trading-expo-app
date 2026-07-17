# 카트 아이템 (거래 게시글의 아이템 목록)

거래 게시글(`Boards`)에 첨부되는 아이템 카트의 데이터 흐름과 id 체계.

## 데이터 흐름 — 비정규화 스냅샷

카트는 카탈로그를 **참조하지 않고 복사**한다. 담는 시점에 필요한 필드만 추려 게시글 문서 안에 저장하고,
이후 표시(PostDetail의 `ItemSummaryList` 등)는 저장된 스냅샷을 그대로 렌더링한다. (카트 아이템 id로 카탈로그를 재조회 X)

```
CatalogItem (+ CatalogVariant)
  → Item { id, category, imageUrl, name, color? }     # src/utilities/catalogItemToItem.ts
  → CartItem { ...Item, quantity: 1, price: 1, unit: 'mileticket' }  # useCartState.addItem
  → 게시글 문서의 cart 필드에 그대로 저장
```

- `color`는 표시용 보조 텍스트 필드로 재사용된다 (아래 표 참조). 아이템 이름 아래 회색 텍스트로 렌더링된다.
- 스냅샷 방식이므로 카탈로그 데이터가 갱신돼도 기존 게시글에는 반영되지 않는다 (작성 시점 기준 — 의도된 동작).

## `color`에 들어가는 텍스트 (src/utilities/catalogItemToItem.ts)

| 케이스 | color 값 | 생성 로직 |
|---|---|---|
| 변형 없는 일반 아이템 | 필드 없음 (undefined) | `catalogItemToItem` — description 없으면 spread 생략 |
| 미술품 (가품이 존재하는 작품만) | `진품` / `가품` | `getCatalogItemDescription` — `ARTWORKS_WITH_FAKES` 목록에 있고 `attributes.genuine`이 Yes/No일 때 |
| 레시피 | `레시피` | `getCatalogItemDescription` — `category === 'Recipes'` |
| 특정 변형 (body만) | `빨강` | `catalogVariantToItem` — `[body, pattern].filter(Boolean).join(', ')` |
| 특정 변형 (body+pattern) | `빨강, 물방울` | 〃 |
| 특정 변형 (pattern만) | `물방울` | 〃 |
| 색상 무관 (모달·일괄 추가 공통) | `색상 무관` | `createAnyVariant`가 만든 합성 variant(`body: ANY_VARIANT_LABEL`)가 `catalogVariantToItem`을 통과 |

- 가품이 없는 미술품(`ARTWORKS_WITH_FAKES` 미포함)은 일반 아이템과 동일하게 color 없음.
- 참고: 아이템 선택 모달의 목록 표시용 이름은 `getCatalogItemDisplayName`이 별도로 처리 — "거룩한 조각 (진품)" 형태. 카트에 저장되는 `name`에는 괄호가 붙지 않는다.

## 카트 id 체계 — 3가지 케이스

| 케이스 | id | 정체 |
|---|---|---|
| 변형 없는 아이템 | `item.id` | 카탈로그 아이템 문서의 uniqueEntryId |
| 특정 변형 선택 | `variant.id` | variant 서브컬렉션 문서의 uniqueEntryId (부모 id와 무관) |
| 색상 무관 | `${item.id}_any` | DB에 없는 합성 id |

- `_any` id·`'색상 무관'` 라벨·합성 variant 생성 규칙은 `src/utilities/catalogItemToItem.ts`의 `createAnyVariant`/`ANY_VARIANT_LABEL`이 **단일 원천**이다. `ItemVariantSelect`(모달)와 `catalogItemToBulkAddItem`(일괄 추가) 모두 이를 사용하고, 변환은 둘 다 `catalogVariantToItem`을 통과한다. 중복 판정용 `getBulkAddCartId`는 변환 결과에서 id를 파생시켜 실제 담기는 id와 항상 일치한다.
- 변형 보유 판정(`bodyTitle || patternTitle`)도 `hasCatalogItemVariants`로 단일화 — 변형 선택 화면 진입 분기와 카트 id 규칙이 공유한다.
- 모달의 "색상 무관" 옵션은 `item.bodyTitle`이 있을 때만 주입되므로 pattern만 있는 아이템에는 선택지가 없다. 반면 일괄 추가는 `bodyTitle || patternTitle`이면 `_any`로 변환한다 (사용자 확정 — docs/task-2 참조).
- 이미지만 다르다:
  - 모달의 색상 무관은 `0_0` variant 이미지 (`createAnyVariant(item, firstVariant.imageUrl)`),
  - 일괄 추가는 부모 `CatalogItem.imageUrl` (`createAnyVariant(item, item.imageUrl)` — 변형 서브컬렉션 조회 0회).

## id의 역할과 제약

id는 카트 안에서만 유일하면 되는 **로컬 식별자**다. 
용도는 3가지: 
- FlatList key
- 중복 추가 판정(`addItem`/`addItems`)
- 수정·삭제 대상 매칭.

**제약: 카트 id로는 카탈로그 역참조가 불가능하다.**
- `${id}_any`는 DB에 존재하지 않는다.
- `variant.id`는 서브컬렉션 문서 id라 부모 아이템 id를 모르면 조회할 수 없다.

"카트 아이템 탭 → 아이템 상세 조회" 같은 기능을 추가하려면 `Item`에 원본 `catalogItemId` 필드를 추가하는 마이그레이션이 필요하다.
(`_any` suffix 파싱만으로는 variant 케이스를 해결할 수 없음).

# Task 3 — 일괄 추가: 타입·상태 단순화 (뷰모델 레이어 제거)

> **실행 순서**: Task 1 → **Task 3** → Task 2 권장. Task 2(`_any` 변형 통일)는 이 작업이 만드는 "단일 변환 지점"에 로직을 얹는 구조라 이 작업을 먼저 하는 게 깔끔함.
> **브랜치**: `feat/bulk-add-items`

## 배경

'아이템 일괄 추가' 기능의 검색 도메인 타입(`src/types/bulkItemMatching.ts`)이 두 레이어로 나뉘어 있다:

1. **매칭 레이어** — Algolia 응답을 라인별로 분류한 결과. `CatalogItem` 기반 (`FoundLineMatchResult`, `NeedsReviewLineMatchResult`, `FailedLineMatchResult`, `CatalogItemCandidate` 등).
2. **리뷰 뷰모델 레이어** — `useBulkAddSelection.applyMatchOutput`에서 `catalogItemToItem`으로 변환해 UI 상태로 쓰는 형태. 카트용 `Item` 기반 (`BulkReviewFoundItem`, `BulkReviewCandidate`, `BulkReviewNeedsReviewItem`).

코드리뷰에서 지적된 문제:

- `CatalogItemCandidate`의 `id/name/category/imageUrl`은 내부 `item: CatalogItem`의 최상위 필드와 완전 중복.
- `BulkReviewCandidate.category`는 어떤 소비처도 읽지 않는 dead field.
- 뷰모델 변환 때문에 `useBulkAddSelection`에 `foundItems`/`reviewItems` 로컬 state와 매핑 코드(`applyMatchOutput`)가 존재 — mutation `data`와 로컬 state라는 두 개의 원천이 생겨 동기화 코드가 복잡함.

사용자 피드백: "뷰모델을 굳이 만들지 말고 기존 타입을 재사용해서 최대한 단순화하고 싶다. 검색 도메인 로직의 복잡도가 높다."

## 결정 사항 (사용자 승인된 계획)

**핵심: `CatalogItem`을 UI까지 끝까지 쓰고, 카트용 `Item` 변환은 확정 시점 한 곳에서만 수행한다.**

1. **`CatalogItemCandidate` 삭제** — `NeedsReviewLineMatchResult.candidates`를 `CatalogItem[]`으로. `toCatalogItemCandidate`(`src/utilities/bulkItemMatching.ts`)도 삭제하고 `classifyCatalogHits`에서 hits를 그대로 사용.
2. **뷰모델 3종 삭제** — `BulkReviewFoundItem`, `BulkReviewCandidate`, `BulkReviewNeedsReviewItem` 제거. Review/FoundRow/ReviewGroup 컴포넌트가 매칭 결과 타입(`FoundLineMatchResult`, `NeedsReviewLineMatchResult`)을 직접 소비.
3. **`useBulkAddSelection`의 `foundItems`/`reviewItems` state 삭제** — mutation `data`에서 `useMemo`로 파생. `applyMatchOutput`의 매핑 코드 제거(analytics 로깅은 onSuccess에 유지).
4. **`selectedReviewItems`를 `Record<string, CatalogItem>`으로** 변경.
5. **`Item` 변환은 `addableItems` 계산(확정 직전) 한 곳에서만** — `catalogItemToItem` 호출 지점이 여기 하나가 됨.
6. **`BulkMatchOutput`의 파생 배열 3개(`foundResults`/`needsReviewResults`/`failedResults`) 제거 검토** — `results` 하나만 반환하고 훅에서 `useMemo`로 필터 파생. (유지해도 무방하나 제거가 계획의 방향)

### UI 표시 관련

- `FoundRow`/`ReviewGroup`/`ItemName`은 현재 `Item.color`(보조 설명)를 표시함. `CatalogItem`에는 `color` 필드가 없으므로, 기존 유틸 `getItemDescription`/`getCatalogItemDisplayName`(`src/utilities/catalogItemToItem.ts`)을 재사용해 표시 문자열을 얻는다. `getItemDescription`이 현재 module-private이면 export 필요.
- `ItemName` 컴포넌트는 `item: Item` 대신 `name`/`description` 문자열 props 또는 `CatalogItem`을 받도록 조정.

## 트레이드오프 (검토 완료)

- **잃는 것**: UI 컴포넌트가 검색 도메인 타입(`CatalogItem`)에 직접 의존. 단, `src/components/NewPost/BulkAddItem/`은 이 기능 전용 폴더라 결합 비용 낮음.
- **얻는 것**: 타입 12개 → 6개 내외, 로컬 state 2개 → 파생값(원천 데이터 단일화로 동기화 버그 여지 제거), CatalogItem→Item 변환 지점 1곳.

## 영향 파일 (약 10개)

- `src/types/bulkItemMatching.ts` — 타입 삭제·정리
- `src/utilities/bulkItemMatching.ts` — `toCatalogItemCandidate` 삭제, `classifyCatalogHits` 조정
- `src/hooks/item/query/useMatchCatalogItems.ts` — 반환 형태 조정(6번 채택 시)
- `src/hooks/item/useBulkAddSelection.ts` — state 제거, useMemo 파생, 변환 지점 이동
- `src/components/NewPost/BulkAddItem/Review.tsx`, `ReviewGroup.tsx`, `FoundRow.tsx`, `ItemName.tsx`, `BulkAddItemModal.tsx` — props 타입 교체
- `src/__tests__/utilities/bulkItemMatching.test.ts` — candidate 구조 변경 반영

## 주의

- 이 세션에서 이미 적용된 수정과 충돌하지 않게 유지할 것: `useBulkAddSelection.searchFromText`의 **stale 응답 가드**(`lastSearchTextRef` 대조 — 주석 포함), `buildCleanedSearchTerm`(단수형, `string | null` 반환).
- 기능 동작은 동일해야 함 (순수 리팩토링).

## 검증

```bash
npm run typecheck
npx jest --selectProjects unit
```

수동 확인: 일괄 추가 전체 플로우(붙여넣기 → 로딩 → found/재확인/실패 섹션 표시 → 후보 선택 → N개 추가하기 → 카트 반영·토스트)가 리팩토링 전과 동일하게 동작하는지.

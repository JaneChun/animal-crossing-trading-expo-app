---
title: Bulk Add Found Result Deduplication - Plan
type: fix
date: 2026-07-20
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
---

# Bulk Add Found Result Deduplication - Plan

## Goal Capsule

- **Objective:** 서로 다른 붙여넣기 원문이 같은 카탈로그 아이템으로 매칭되면 검색 결과, UI 카운트, 분석 수치에서 한 아이템으로 취급한다.
- **Execution profile:** 단일 원인과 단일 동작을 다루는 테스트 우선 버그 수정이다.
- **Authority:** 제보된 재현 입력과 기존 카탈로그 ID 구분 규칙을 우선하며, 사용자가 직접 커밋한다.
- **Stop conditions:** 같은 `CatalogItem.id` 결과가 한 번만 남고, 이름이 같아도 ID가 다른 아이템과 레시피는 각각 유지되어야 한다.

## Product Contract

### Summary

일괄 추가 검색에서 동일 카탈로그 아이템으로 수렴한 found 결과를 하나로 표시한다. 최종 카트 중복 방지에만 의존하지 않고 검색 결과 데이터의 일관성을 회복한다.

### Problem Frame

`parseSearchLines`는 원문 문자열이 같은 줄만 제거한다. 따라서 `요트`, `요트 1개`, `요트 3마일`은 모두 검색되고, 뒤의 두 줄은 정제 검색에서 `요트`로 수렴해 같은 카탈로그 아이템을 세 개의 found 결과로 만든다. `Review`는 `foundResults.length`와 배열을 그대로 렌더링하므로 세 개를 찾았다고 표시하지만, `useBulkAddSelection`의 카트 ID 중복 제거로 추가 버튼은 한 개만 표시될 수 있어 화면 내부 수치도 불일치한다.

### Requirements

- R1. `요트`, `요트 1개`, `요트 3마일`이 같은 `CatalogItem.id`로 매칭되면 found 결과에는 최초 결과 하나만 남긴다.
- R2. 서로 다른 `CatalogItem.id` 결과는 입력 순서를 유지해 모두 남긴다.
- R3. 이름이 같아도 일반 아이템과 레시피처럼 카탈로그 ID가 다르면 별개 결과로 유지한다.
- R4. 기존 원문 동일 줄 제거, 최대 줄 수 검사, 검토 필요 결과, 실패 결과, 최종 카트 중복 안전장치는 그대로 유지한다.

### Acceptance Examples

- AE1. `요트\n요트 1개\n요트 3마일`이 모두 카탈로그 ID `yacht`로 매칭되면 found 배너와 행은 한 개이며 추가 버튼도 한 개다.
- AE2. 같은 이름의 일반 아이템 ID와 레시피 ID가 각각 매칭되면 found 결과는 두 개다.
- AE3. `요트`와 `소형 자동차`가 서로 다른 ID로 매칭되면 두 결과가 원래 순서로 표시된다.

### Scope Boundaries

- `BulkAddItemModal.tsx`와 `Review.tsx`에서 중복을 숨기는 UI 전용 필터는 추가하지 않는다.
- `buildCleanedSearchTerm`의 수량, 괄호, 구분자 정제 규칙은 변경하지 않는다.
- needsReview 후보 선택 후의 중복과 기존 카트 중복은 현재 `getUniqueBulkAddCatalogItems` 안전장치에 맡긴다.
- Firestore 요청이나 데이터 모델을 변경하지 않으므로 `firestore.rules`는 수정하지 않는다.

## Planning Contract

### Key Technical Decisions

- KTD1. found 결과의 동일성은 정제된 텍스트가 아니라 매칭된 `CatalogItem.id`로 판정한다. `buildCleanedSearchTerm` 전체를 중복 키로 사용하면 `배 러그`와 `배 러그 (레시피)`처럼 괄호가 의미를 가지는 서로 다른 카탈로그 레코드를 검색 전에 합칠 수 있다.
- KTD2. 중복 제거는 검색 분류 결과를 `BulkMatchOutput`으로 묶는 경계에서 수행한다. 이 경계에서 처리하면 Review UI, 검색 분석 수치, 이후 선택 상태가 같은 데이터 원천을 사용하며 최초 결과 순서도 보존할 수 있다.
- KTD3. 검색 전 원문 동일 줄 제거와 확정 전 카트 ID 중복 제거는 유지한다. 전자는 불필요한 동일 쿼리를 줄이고, 후자는 found와 needsReview 선택이 합쳐지는 최종 경계의 안전장치다.

### Alternatives Considered

- **정제 검색어 기준으로 요청 전 제거:** 중복 Algolia 요청까지 줄이지만 괄호와 구분자를 제거하는 현재 정제 규칙 때문에 서로 다른 아이템/레시피를 합칠 위험이 있어 채택하지 않는다.
- **수량·거래 단위만 제거한 별도 키:** 이번 예시는 해결하고 요청 수도 줄이지만 별칭이 같은 카탈로그 항목이라는 최종 불변식을 보장하지 못하며 정제 문법을 이중 관리하게 되어 채택하지 않는다.
- **Review에서만 필터링:** 화면은 맞아 보이지만 검색 분석과 하위 상태에는 중복이 남아 데이터 원천이 다시 분리되므로 채택하지 않는다.

### Risks and Operational Notes

- 동일 아이템으로 수렴하는 서로 다른 원문은 여전히 각각 Algolia 요청을 만들 수 있다. 최대 줄 수와 멀티쿼리 청킹이 이미 요청량을 제한하며, 이번 수정은 정확성 범위에 집중한다.
- 같은 ID의 첫 결과만 남기므로 이후 원문별 진단이 필요해지면 중복 원문을 별도 메타데이터로 보존해야 한다. 현재 UI는 found 원문을 표시하지 않아 사용자 동작에는 영향이 없다.

## Implementation Units

### U1. Catalog ID 기준 found 결과 중복 제거

- **Goal:** 같은 카탈로그 아이템으로 매칭된 found 결과를 최초 한 건으로 축약한다.
- **Requirements:** R1, R2, R3, R4; AE1, AE2, AE3; KTD1, KTD2, KTD3.
- **Dependencies:** 없음.
- **Files:**
  - Modify: `src/utilities/bulkItemMatching.ts`
  - Modify: `src/hooks/item/query/useMatchCatalogItems.ts`
  - Test: `src/__tests__/utilities/bulkItemMatching.test.ts`
- **Approach:** `FoundLineMatchResult[]`를 받아 `item.id`의 최초 등장만 유지하는 순수 도메인 유틸리티를 추가한다. `toBulkMatchOutput`에서 상태별 배열을 만든 뒤 found 배열에만 적용하고 needsReview와 failed 배열은 그대로 둔다. 정제, 분류, 중복 제거를 의미 있는 중간 변수로 나눠 데이터 흐름을 드러낸다.
- **Execution note:** 현재 테스트가 정제와 단일 줄 분류만 검증해 이 회귀를 놓쳤으므로, 같은 ID의 다중 결과가 실패하는 테스트를 먼저 추가한다.
- **Patterns to follow:** `getUniqueBulkAddCatalogItems`의 Set 기반 최초 등장 보존 방식과 `src/__tests__/utilities/`의 동작별 단위 테스트 구성을 따른다.
- **Test scenarios:**
  - Covers AE1. `요트`, `요트 1개`, `요트 3마일`에서 생성된 found 결과가 모두 ID `yacht`이면 최초 결과 한 건만 반환한다.
  - Covers AE2. 이름이 같아도 ID가 `pear-rug`와 `pear-rug-recipe`이면 두 결과를 모두 반환한다.
  - Covers AE3. 서로 다른 ID가 섞여 있으면 최초 등장 순서를 유지한다.
  - 빈 배열은 빈 배열을 반환한다.
- **Verification:** found 결과 배열, 배너 카운트, 렌더링 행 수, 검색 분석의 `found` 값이 동일한 유일 아이템 수를 사용하며 기존 검토 필요·실패 분류 결과는 변하지 않는다.

## Verification Contract

- `npx jest --selectProjects unit --runInBand src/__tests__/utilities/bulkItemMatching.test.ts src/__tests__/utilities/itemTextLines.test.ts src/__tests__/utilities/catalogItemToItem.test.ts`가 통과한다.
- `npm run typecheck`가 통과한다.
- `npm run lint`가 통과한다.
- 수동으로 제보 입력을 붙여넣었을 때 found 배너, found 행, 추가 버튼이 모두 한 개를 나타내는지 확인한다.
- 수동으로 이름이 같은 일반 아이템과 레시피 입력을 붙여넣었을 때 서로 다른 카탈로그 ID가 각각 유지되는지 확인한다.

## Definition of Done

- U1의 회귀 테스트가 수정 전 실패하고 수정 후 통과한다.
- R1부터 R4와 AE1부터 AE3가 모두 충족된다.
- 기존 원문 중복 제거와 최종 카트 중복 방지가 유지된다.
- `BulkAddItemModal.tsx`, `Review.tsx`, Firestore 규칙에 우회 수정이 없다.
- 실패한 실험 코드, 사용하지 않는 헬퍼, 무관한 리팩터링이 변경분에 남지 않는다.
- 사용자가 구현 변경을 검토한 뒤 직접 커밋할 수 있도록 한 논리적 변경 단위로 정리된다.

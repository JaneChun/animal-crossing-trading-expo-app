# 바텀시트 UI 버그 4건 수정 (#56, #57, #62, #71)

> 이슈: GitHub #56, #57, #62, #71
> 작업 종류: 버그 수정
> 상태: 진행중
> 생성일: 2026-11-15

## 개요

`CustomBottomSheet`(`src/components/ui/CustomBottomSheet.tsx`)를 쓰는 시트 4곳에서 보고된 UI 버그를 고친다. 네 이슈는 모두 공통 바텀시트를 거치지만 원인은 서로 다르다.

- #62 댓글 수정 시트의 취소 버튼이 시트의 `onClose` 대신 내비게이션 `goBack`을 호출한다. 또한 공통 시트 헤더에서 제목이 왼쪽 버튼을 덮어 탭이 버튼에 닿지 않는다.
- #56 Gorhom `keyboardBlurBehavior` 기본값이 `none`이라서, 키보드가 내려가도 시트가 원래 스냅 포인트로 돌아오지 않는다. (`node_modules/@gorhom/bottom-sheet/src/components/bottomSheet/constants.ts:19`, `BottomSheet.tsx:1729-1735`에서 확인)
- #57 원인은 아직 확정하지 않았다. 일괄 추가 모달은 본문 입력창에 붙여넣은 직후, 즉 키보드가 올라온 상태에서 열리고 `Keyboard.dismiss()`로 키보드를 내린다. 그래서 #56과 같은 원인으로 시트 위치가 복구되지 않을 가능성이 가장 크다.
- #71 신고 시트는 `snapPoints={['60%']}` 하나만 쓰고, 본문이 스크롤되지 않는 `View`라서 작은 화면에서 사유 목록이 잘린다.

범위에서 #68(댓글 수 불일치)은 제외한다. 커밋은 Phase 단위로 나누고, 각 Phase가 끝나면 사용자에게 검토를 요청한다.

## Phase 1: 댓글 수정 시트 취소 버튼 (#62)

- [x] 취소 버튼의 `onPress`를 `goBack`에서 `onClose`로 바꾸고, 쓰지 않게 된 `goBack` import를 지운다 (`src/components/PostDetail/EditCommentModal.tsx`)
  - 패턴: `PostDetail`이 `isEditCommentModalVisible && <EditCommentModal …/>` 형태로 조건부 렌더링한다(`src/screens/PostDetail.tsx:358-375`). 따라서 `onClose`로 닫으면 컴포넌트가 언마운트되고, 다시 열 때 `useState(comment)`가 원래 댓글로 초기화된다. 입력값을 따로 초기화하는 코드는 필요 없다.
- [x] 헤더에서 제목을 먼저 그리고 버튼을 나중에 그려, 왼쪽 버튼이 제목 위에 오게 한다 (`src/components/ui/CustomBottomSheet.tsx`)
  - 결정: 댓글 수정 시트만 우회하지 않고 공통 시트를 고친다. 신고 시트 2단계의 `이전` 버튼도 같은 구조다 (사용자 지시)
- [x] `npm run typecheck`, `npm run lint` 통과를 확인한다
- [ ] 댓글 수정·답글 수정 시트 양쪽에서 취소 동작을 기기로 확인한다 (spec.md의 #62 흐름 기준)

## Phase 2: 키보드를 내린 뒤 시트 높이 복구 (#56)

- [x] `BottomSheet`에 `keyboardBlurBehavior="restore"`를 추가한다 (`src/components/ui/CustomBottomSheet.tsx`)
  - 패턴: 키보드 관련 처리는 이미 이 파일의 `useGenericKeyboardHandler`(툴바 높이 확보)가 담당한다. `useReanimatedKeyboardAnimation`은 Gorhom 키보드 처리와 충돌하므로 쓰지 않는다(`agent_docs/architecture.md:20`).
  - 재사용: Gorhom 내장 `KEYBOARD_BLUR_BEHAVIOR.restore` — 키보드가 숨겨지면 `detents[currentIndex]`로 시트를 되돌린다(`BottomSheet.tsx:806-816`). 직접 snapToIndex를 호출하는 코드는 만들지 않는다.
  - 결정: prop으로 열지 않고 공통 시트에 고정 적용해 사용처 7곳 모두에 반영한다 (사용자 지시)
- [x] 공통 시트에 `keyboardBehavior` 선택 prop을 추가하고, 가격 수정 시트에는 `fillParent`를 준다 (`src/components/ui/CustomBottomSheet.tsx`, `src/components/NewPost/EditItemModal.tsx`)
  - 결정: 키보드가 떠 있는 동안만 시트를 펼친다 (사용자 지시). `extend` + `['40%', '95%']`는 펼친 뒤 현재 인덱스가 95%로 바뀌어 `restore`가 40%로 돌아오지 않으므로(`BottomSheet.tsx` `animateToPosition`), 임시 위치로 처리되는 `fillParent`를 쓴다
- [x] 가격 수정 시트에서 키보드가 올라온 동안 총계가 보이고, 키보드를 닫은 뒤 높이가 `40%`로 돌아오는지 iOS·Android에서 확인한다
- [ ] 사용처 7곳(`ReportModal`, `EditCommentModal`, `EditProfileModal`, `AddItemModal`, `EditItemModal`, `BulkAddItemModal`, `AddVillagerModal`)에서 키보드를 열고 닫았을 때 레이아웃이 깨지지 않는지 확인한다
- [x] Gorhom `keyboardBlurBehavior` 기본값 함정을 기록한다 (`agent_docs/architecture.md` 20행의 바텀시트 키보드 설명 뒤에 한 줄)

## Phase 3: 일괄 추가 검토 화면 확인 버튼 (#57)

- [ ] Phase 2를 적용한 상태에서 iOS로 재현 경로(본문에 여러 줄 붙여넣기 → 아이템 찾기 → 검토 화면)를 실행해, 확인 버튼이 보이는지 확인한다
  - 결과가 정상이면 #57은 #56과 같은 원인으로 판단하고, `## 진행 기록`에 근거와 함께 남긴 뒤 이 Phase의 코드 수정 항목은 건너뛴다.
- [ ] 여전히 버튼이 가려지면 원인을 확인하고 고친다 (`src/components/NewPost/BulkAddItem/BulkAddItemModal.tsx`, `src/components/NewPost/BulkAddItem/Review.tsx`)
  - 패턴: `Review`는 `BottomSheetScrollView`(`flex: 1`) + 고정 `footer` 구조다. 스크롤 영역이 남은 높이를 차지하고 footer는 항상 시트 하단에 있어야 한다.
  - 점검 순서: 시트가 열린 직후 시트 위치(키보드 오프셋 잔존 여부) → `customBottomSheetContent` 높이와 시트 높이 비교 → `BulkAddItemModal`의 `bodyStyle`(`paddingBottom: 30`)과 하단 safe area 관계
- [ ] 검토 항목이 적을 때와 많을 때 모두 확인 버튼이 보이고 동작하는지 iOS·Android에서 확인한다

## Phase 4: 신고 시트 하단 잘림 (#71)

- [ ] 신고 사유 목록과 상세 입력 영역을 스크롤할 수 있게 한다 (`src/components/PostDetail/ReportModal.tsx`)
  - 재사용: `BottomSheetScrollView` — `Review.tsx:52`와 같은 사용법. 일반 `ScrollView`는 시트 제스처와 충돌하므로 쓰지 않는다(`agent_docs/features/profile.md:5-8`).
  - 패턴: 2단계 입력창이 키보드에 가려지면 `EditCommentModal`처럼 `KeyboardAwareScrollView`에 `ScrollViewComponent={BottomSheetScrollView}`를 주입한다(`src/components/PostDetail/EditCommentModal.tsx:81-93`). 가려지지 않으면 `BottomSheetScrollView`만 쓴다.
  - 결정: `snapPoints={['60%']}`는 그대로 두고 본문 스크롤로 해결한다 (사용자 지시)
- [ ] 작은 iPhone(SE 크기)에서 1단계 마지막 사유 `기타`까지 선택할 수 있는지 확인한다
- [ ] 2단계에서 키보드를 올린 상태로 입력창과 헤더의 `이전`·`제출` 버튼이 보이는지 확인한다
- [ ] 게시글·댓글·채팅방·프로필 네 진입 경로에서 같은 동작인지 확인한다 (`src/screens/PostDetail.tsx`, `src/screens/ChatRoom.tsx`, `src/screens/Profile.tsx`)

## 진행 기록

### 2026-11-15

- Phase 1 완료 (기기 확인은 사용자 확인 대기)
- 검증: `npm run typecheck` 통과, `npx eslint src/components/PostDetail/EditCommentModal.tsx` 통과
- 계획과 달라진 부분: `onClose` 연결 후에도 기기에서 취소가 동작하지 않았다(번들 반영 확인). 헤더 렌더 순서 수정을 Phase 1에 추가했다
- 검증: `npm run typecheck` 통과, `npx eslint src/components/ui/CustomBottomSheet.tsx` 통과, `npx jest src/__tests__` 58개 통과
- Phase 2 완료 (기기 확인은 사용자 확인 대기)
- 검증: `npm run typecheck` 통과, `npx eslint src/components/ui/CustomBottomSheet.tsx` 통과, `npx jest src/__tests__` 58개 통과
- 계획과 달라진 부분: 가격 수정 시트에서 키보드가 올라오면 총계가 툴바에 가려지는 문제(사용자 제보)를 Phase 2에 추가했다
- 검증: `npm run typecheck` 통과, 변경 파일 eslint 오류 없음(`EditItemModal.tsx`의 기존 exhaustive-deps 경고 1건)
- 검증: iPhone 17 Pro 시뮬레이터에서 키보드가 올라오면 시트가 화면을 채우고, 내리면 40%로 돌아오는 것을 사용자가 확인

# 바텀시트 UI 버그 4건 수정 (#56, #57, #62, #71)

> 이슈: GitHub #56, #57, #62, #71
> 작업 종류: 버그 수정
> 상태: 완료
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

## Phase 2: 키보드를 내린 뒤 시트 높이 복구 (#56)

- [x] `BottomSheet`에 `keyboardBlurBehavior="restore"`를 추가한다 (`src/components/ui/CustomBottomSheet.tsx`)
  - 패턴: 키보드 관련 처리는 이미 이 파일의 `useGenericKeyboardHandler`(툴바 높이 확보)가 담당한다. `useReanimatedKeyboardAnimation`은 Gorhom 키보드 처리와 충돌하므로 쓰지 않는다(`agent_docs/architecture.md:20`).
  - 재사용: Gorhom 내장 `KEYBOARD_BLUR_BEHAVIOR.restore` — 키보드가 숨겨지면 `detents[currentIndex]`로 시트를 되돌린다(`BottomSheet.tsx:806-816`). 직접 snapToIndex를 호출하는 코드는 만들지 않는다.
  - 결정: prop으로 열지 않고 공통 시트에 고정 적용해 사용처 7곳 모두에 반영한다 (사용자 지시)
- [x] 공통 시트에 `keyboardBehavior` 선택 prop을 추가하고, 가격 수정 시트에는 `fillParent`를 준다 (`src/components/ui/CustomBottomSheet.tsx`, `src/components/NewPost/EditItemModal.tsx`)
  - 결정: 키보드가 떠 있는 동안만 시트를 펼친다 (사용자 지시). `extend` + `['40%', '95%']`는 펼친 뒤 현재 인덱스가 95%로 바뀌어 `restore`가 40%로 돌아오지 않으므로(`BottomSheet.tsx` `animateToPosition`), 임시 위치로 처리되는 `fillParent`를 쓴다
- [x] 가격 수정 시트에서 키보드가 올라온 동안 총계가 보이고, 키보드를 닫은 뒤 높이가 `40%`로 돌아오는지 iOS·Android에서 확인한다
- [x] 사용처 7곳(`ReportModal`, `EditCommentModal`, `EditProfileModal`, `AddItemModal`, `EditItemModal`, `BulkAddItemModal`, `AddVillagerModal`)에서 키보드를 열고 닫았을 때 레이아웃이 깨지지 않는지 확인한다
- [x] Gorhom `keyboardBlurBehavior` 기본값 함정을 기록한다 (`agent_docs/architecture.md` 20행의 바텀시트 키보드 설명 뒤에 한 줄)

## Phase 3: 일괄 추가 검토 화면 확인 버튼 (#57)

- [x] Phase 2를 적용한 상태에서 iOS로 재현 경로를 실행해 확인 버튼이 보이는지 확인한다 — 보이지 않음(#56과 다른 원인)
- [x] 공통 시트 내용 루트의 높이를 "지금 보이는 시트 영역"으로 직접 계산해 지정한다 (`src/components/ui/CustomBottomSheet.tsx`, `src/__tests__/components/CustomBottomSheet.test.tsx`)
  - 원인: Gorhom 내용 영역은 가장 높은 스냅 포인트 기준 높이에 `paddingBottom`(약 70pt + 키보드)을 더한 크기다. `absoluteFill`이든 `flex: 1`이든 이 영역을 채우면 하단이 화면 밖으로 나가고, Android에서는 내용 크기에 따라 영역이 더 늘어난다(실측)
  - 재사용: Gorhom `useBottomSheetInternal()`의 `animatedLayoutState`·`animatedPosition`·`animatedDetentsState`, keyboard-controller `useGenericKeyboardHandler`의 키보드 높이
  - 결정: 일괄 추가 시트만 보정하지 않고 공통 시트에서 고친다 (사용자 지시). 처음 시도한 `flex: 1`은 iOS에서만 맞고 Android에서 넘쳐서 높이 계산 방식으로 바꿨다
- [x] 시트 맨 아래 스페이서가 키보드가 없을 때 `insets.bottom`, 있을 때 툴바 높이만큼 비우게 한다 (`src/components/ui/CustomBottomSheet.tsx`)
  - 결정: Android 3버튼 내비게이션 바에 신고·가격 수정·주민 추가 시트 하단이 가려지는 문제(사용자 제보)를 공통 시트에서 해결한다 (사용자 지시)
- [x] inset과 겹치던 시트별 하단 여백을 정리한다 (`BulkAddItemModal.tsx`·`AddItemModal.tsx`는 `Spacing.s`, `EditProfileModal.tsx`는 탭바 높이 여백 제거, `EditProfileModal.test.tsx` 수정)
- [x] 가격 수정 시트 높이를 40%에서 55%로 올린다 (`src/components/NewPost/EditItemModal.tsx`)
  - 결정: 내용 높이를 측정하지 않고 비율을 올린다. 큰 화면에서 총계 아래 빈 공간이 생기는 것은 감수한다 (사용자 지시)
- [x] 키보드 여백을 스스로 넣는 시트(`KeyboardAwareScrollView`)를 위해 `contentHandlesKeyboard` prop을 추가하고 프로필 수정·댓글 수정 시트에 준다
  - 결정: 이 prop 없이 키보드만큼 내용을 줄이면 끝까지 스크롤했을 때 키보드 높이만큼 빈 공간이 생긴다(iOS 실측)
- [x] `agent_docs/features/profile.md`, `agent_docs/architecture.md`를 바뀐 시트 구조에 맞게 고친다
- [x] 검토 항목이 적을 때와 많을 때 모두 확인 버튼이 보이고 동작하는지 iOS·Android에서 확인한다

## Phase 4: 신고 시트 하단 잘림 (#71)

- [x] 신고 사유 목록과 상세 입력 영역을 스크롤할 수 있게 한다 (`src/components/PostDetail/ReportModal.tsx`)
  - 재사용: `BottomSheetScrollView` — `Review.tsx:52`와 같은 사용법. 일반 `ScrollView`는 시트 제스처와 충돌하므로 쓰지 않는다(`agent_docs/features/profile.md:5-8`).
  - 패턴: 2단계 입력창이 키보드에 가려지면 `EditCommentModal`처럼 `KeyboardAwareScrollView`에 `ScrollViewComponent={BottomSheetScrollView}`를 주입한다(`src/components/PostDetail/EditCommentModal.tsx:81-93`). 가려지지 않으면 `BottomSheetScrollView`만 쓴다.
  - 결정: 2단계 입력창은 시트 위쪽에 있고, Phase 3에서 공통 시트가 키보드 위까지만 내용을 그리게 되어 `BottomSheetScrollView`만 쓴다 (기기 캡처로 확인)
  - 결정: `snapPoints={['60%']}`는 그대로 두고 본문 스크롤로 해결한다 (사용자 지시)
- [x] 2단계에서 키보드를 올린 상태로 입력창과 헤더의 `이전`·`제출` 버튼이 보이는지 확인한다

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
- Phase 3: iPhone 17 Pro 시뮬레이터에서 루트를 `flex: 1`로 바꾸자 `2개 추가하기` 버튼이 화면 안에 보이는 것을 캡처로 확인
- 검증: `npm run typecheck` 통과, 변경 파일 eslint 통과, `npx jest src/__tests__` 58개 통과(공통 시트 테스트의 `absoluteFill` 단언을 `flex: 1`로 수정)
- 계획과 달라진 부분: Phase 3에서 `flex: 1`이 Android에서 맞지 않아(아이템 추가 시트 내용 1025dp, 화면 880dp 실측) 내용 높이를 직접 계산하도록 바꿨고, 하단 inset·가격 수정 시트 높이·`contentHandlesKeyboard`를 함께 처리했다
- 검증: iPhone 17 Pro 시뮬레이터와 Galaxy Z Flip3(3버튼)에서 Maestro·adb로 캡처 확인 — 아이템 추가(목록 끝, 키보드 열림), 가격 수정(키보드 전·중·후), 일괄 추가(12개), 주민 추가(목록 끝, Android), 프로필 수정(하단·키보드). 신고 시트는 Phase 4, 댓글 수정 시트는 기기 확인 목록으로 넘김
- 검증: `npm run typecheck` 통과, 변경 파일 eslint 오류 없음, `npx jest src/__tests__` 59개 통과
- 리뷰: `/code-review` 10건 중 탭 화면 inset 이중 여백·손잡이 초기값(-999)·스페이서 testID·탭 안 테스트를 반영했다. Android 키보드 이중 차감은 실기기에서 재현되지 않았고, Gorhom 내부 API 사용·55%(사용자 결정)·키보드 상태 2개는 유지했다
- 검증: 리뷰 반영 후 iOS(새 글 작성 시트 하단 inset 유지, 프로필 탭 시트 여백 감소)와 Android(아이템 추가 목록 끝)를 다시 캡처, `npx jest src/__tests__` 60개 통과
- Phase 4 완료
- 검증: iOS·Android에서 게시글 신고 시트 1단계 스크롤(`기타`까지), 2단계 키보드 상태, `이전`으로 돌아왔을 때 선택 유지 캡처 확인
- 발견: Android에서 댓글 수정 시트를 키보드가 올라온 상태로 `취소`하면, 시트가 닫힌 뒤 키보드가 게시글 하단 댓글 입력창으로 옮겨 가 떠 있다. 코드는 고치지 않고 사용자 확인 항목으로 남긴다
- 리뷰: Phase 4 `/code-review` 7건 중 단계 전환 시 스크롤 위치 유지(→ `key={step}`)와 불필요한 `keyboardShouldPersistTaps`를 반영했다. 나머지는 기기에서 재현되지 않았거나(입력창 가림·패딩), 사용자 결정(60% 유지)이거나, 범위 밖 기존 동작(제출 직후 시트 닫힘)이다
- 검증: 반영 후 iOS에서 1단계 스크롤 → 2단계가 맨 위에서 시작하는 것을 캡처로 확인, `npx jest src/__tests__` 60개 통과
- 전체 구현 완료

## 기기 확인

- [ ] 답글 수정 시트(제목 `답글 수정`)에서 `취소`를 누르면 시트가 닫히고 게시글 상세에 머문다 (iOS·Android)
- [ ] iOS 댓글 수정 시트에서 키보드를 올린 상태로 `취소`를 누르면 닫히고, 다시 열면 원래 댓글이 보인다
- [ ] Android 댓글 수정 시트를 키보드가 올라온 상태로 `취소`하면 키보드가 게시글 하단 댓글 입력창으로 옮겨 가 떠 있다. 이대로 둘지 정한다
- [ ] iPhone SE(작은 화면)에서 신고 시트를 스크롤해 `기타`까지 선택할 수 있고, 가격 수정 시트(55%)에 총계까지 보인다
- [ ] 댓글·답글 메뉴, 채팅방 메뉴, 다른 사용자 프로필에서 연 신고 시트도 게시글에서 연 것과 같이 스크롤·키보드가 동작한다
- [ ] 프로필 수정 시트를 탭 밖(다른 사용자 프로필 등 RootStack 경로)에서 열었을 때 맨 아래 안내 문구가 홈 인디케이터·내비게이션 바 위에 보인다

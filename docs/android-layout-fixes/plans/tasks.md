# Android 레이아웃 이슈 일괄 수정 (#58, #59, #60, #61)

> 이슈: GitHub #58, #59, #60, #61
> 작업 종류: 버그 수정
> 상태: 완료
> 생성일: 2026-11-14

## 개요

Android 출시 대응 이후 실기기(SM-F711N, 3버튼 내비게이션)에서 레이아웃 문제 4건이 확인되었다. 브랜치 `fix/issue-58-61-android-layout` 하나에서 모두 고치고 PR 하나로 올린다.

원인은 두 갈래다.

- **키보드 회피(#59, #61)**: `android/gradle.properties`의 `edgeToEdgeEnabled=true`와 `App.tsx`의 `KeyboardProvider`(react-native-keyboard-controller) 때문에, Android에서 키보드가 올라와도 창 높이가 줄어들지 않는다. 그런데 해당 화면들은 RN 기본 `KeyboardAvoidingView`를 Android에서 `behavior='height'` 또는 `undefined`로 쓰고 있어서, 인풋과 버튼이 키보드 위로 올라가지 않는다.
- **레이아웃 값(#58, #60)**: `NameInput`과 프로필 수정 모달의 칭호 인풋은 `height: 45`에 `padding: 12`를 함께 줘서 글자가 들어갈 높이가 19dp밖에 남지 않는다. Android는 이 높이가 16px 글자의 줄 높이보다 작으면 글자를 위로 밀어 그린다. 새 글 작성 화면의 하단 버튼 영역에는 하단 safe area 여백이 없어서, edge-to-edge인 Android에서 내비게이션 바와 겹친다.

범위에서 제외하는 것: 이슈에 나열된 다른 인풋(`ChatInput`, `CommentInput`, `SearchInput`, `NumberInput`, `DropdownInput`, `EditCommentModal`, `ReportModal`, `ItemSelect`, `VillagerSelect`, `EditItemModal`)은 고정 높이와 세로 padding을 함께 쓰는 패턴이 없다. 이 인풋들은 Phase 4에서 스크린샷으로 확인만 하고, 어긋남이 보일 때만 수정 대상에 추가한다.

공통 규칙: iOS 레이아웃은 바뀌지 않아야 한다(예외: #60 새 글 작성 하단 버튼 여백). 모든 항목은 iOS 시뮬레이터와 Android 실기기 양쪽에서 확인한다. Before 스크린샷은 `$TMPDIR/fix-issue/issue-58-61/`에 있다.

## Phase 1: 인풋 글자 세로 정렬 (#58)

- [x] 닉네임·섬 이름 인풋의 세로 padding 제거 (`src/components/Profile/NameInput.tsx`)
  - 패턴: `padding: 12` → `paddingHorizontal: 12`. `height: 45`와 `textAlignVertical: 'center'`는 유지한다. iOS 단일 행 TextInput은 높이 안에서 글자를 자동으로 가운데 정렬하므로 iOS 모습은 바뀌지 않는다.
  - 사용처: `SignUpDisplayName`, `SignUpIslandName`, `EditProfileModal`(닉네임·섬 이름)
  - 결정: `paddingVertical: 0`을 명시한다(실측 기준). `paddingHorizontal`만 주면 Android 인풋의 기본 세로 여백이 되살아나 글자가 약 1.8dp 위로 치우쳤다. `includeFontPadding: false`는 효과가 1px 이하여서 넣지 않았다.
- [x] 프로필 수정 모달의 칭호 인풋 세로 padding 제거 (`src/components/Profile/EditProfileModal.tsx`의 `titleInput` 스타일)
  - 패턴: 위 항목과 같은 변경(`paddingVertical: 0` 포함)
- [x] 검증: 회원가입 닉네임·섬 이름 화면, 프로필 수정 모달(닉네임·섬 이름·칭호)을 양쪽 기기에서 촬영해 Before와 비교

## Phase 2: 새 글 작성 하단 버튼 여백 (#60)

- [x] 하단 버튼 영역에 하단 inset 여백 추가 (`src/screens/NewPost.tsx`의 `buttonContainer`)
  - 재사용: 이미 선언된 `const insets = useSafeAreaInsets()` (`NewPost.tsx:45`)
  - 패턴: 정적 스타일 `padding: PADDING`은 그대로 두고, 렌더링 시 `paddingBottom`만 `insets.bottom`으로 덮어쓴다
  - 결정: 하단 여백은 `PADDING + insets.bottom`이 아니라 `insets.bottom`만 쓴다(사용자가 직접 수정). Android만 8을 더한다(사용자 지시). `insets.bottom`만 주면 제스처 모드에서 버튼이 내비게이션 바에 딱 붙어 홈 제스처 영역에 걸치기 때문이다.
  - 결정: iOS·Android 모두 적용한다(사용자 지시). 기존 여백은 플랫폼 공통 24 하드코딩이라 iOS도 홈 인디케이터에 약 10pt 걸쳐 있었고, 다른 화면처럼 하단 inset을 반영하도록 맞춘다. iOS 버튼은 약 10pt 위로 올라간다.
- [x] 본문 인풋 placeholder가 Android에서 세로 가운데에 표시되는 문제 수정 (`src/components/NewPost/BodyInput.tsx`)
  - 패턴: `verticalAlign: 'middle'` 삭제. RN `TextInput`은 `verticalAlign`을 `textAlignVertical`로 변환해 덮어쓰므로(`'middle'` → `'center'`), 같은 스타일의 `textAlignVertical: 'top'`이 무시되고 있었다.
  - 결정: 계획 밖 수정이지만 이번 브랜치에 포함한다(사용자 지시). 이슈 목록에 없던 기존 문제다.
- [x] 검증: 3버튼 내비게이션과 제스처 내비게이션 양쪽에서 촬영. 기기의 현재 모드는 3버튼(`navigation_mode=0`)이며, 제스처 모드 전환은 사용자에게 요청하고 끝나면 원래대로 되돌린다. 키보드를 올린 상태도 촬영한다.

## Phase 3: Android 키보드 회피 (#59, #61)

- [x] 닉네임 입력 화면의 `KeyboardAvoidingView`를 keyboard-controller 버전으로 교체 (`src/screens/SignUpDisplayName.tsx`)
  - 재사용: `KeyboardAvoidingView` from `react-native-keyboard-controller` (1.20.7, 이미 설치됨. `EditCommentModal`·`EditProfileModal`은 같은 패키지의 `KeyboardAwareScrollView`를 사용 중)
  - 패턴: keyboard-controller의 KAV는 RN KAV와 같은 계산식(`frame.y + frame.height - (화면 높이 - 키보드 높이 - offset)`)을 쓰므로, iOS의 `behavior`와 `keyboardVerticalOffset`은 그대로 둔다. Android `behavior`는 `'padding'`으로 시작하고, 버튼 위치가 맞지 않으면 Android offset만 실측해서 조정한다.
  - 결정: Android offset은 `insets.top + KEYBOARD_TOOLBAR_HEIGHT - 24`(컨테이너 아래 패딩)로 계산한다(사용자 지시, A안). 하단 inset을 쓰던 기존 식은 3버튼 모드에서 iPhone보다 약 20dp 더 올라가고 제스처 모드에서는 덜 올라간다
- [x] 섬 이름 입력 화면에 같은 변경 적용 (`src/screens/SignUpIslandName.tsx`)
- [x] 게시글 상세의 댓글 인풋 `KeyboardAvoidingView`를 keyboard-controller 버전으로 교체 (`src/screens/PostDetail.tsx:307`)
  - 패턴: 위와 같다. 현재 Android는 `behavior='height'`인데, 감싼 View에 높이가 없으므로 `'height'`는 인풋을 줄이기만 한다. Android도 `'padding'`으로 바꾸고 offset을 실측한다.
  - 결정: Android offset은 `insets.top + LAYOUT_HEADER_HEIGHT(44, LayoutWithHeader에서 export) + KEYBOARD_TOOLBAR_HEIGHT - 8`(입력창 아래 여백)로 계산해 입력창과 툴바 사이를 8dp로 맞춘다(사용자 지시, A안). iOS 식의 `insets.bottom + 10`은 화면 안 헤더 높이(약 44dp)를 대신하는 값이라 iPhone(34 + 10)에서만 맞는다
- [x] 채팅방 인풋 확인 (`src/screens/ChatRoom.tsx`) — 코드 변경은 문제가 보일 때만
  - 패턴: `react-native-gifted-chat` 2.8은 내부에서 keyboard-controller를 쓰므로 이미 정상일 가능성이 높다
  - 결정: Android만 `bottomOffset`에서 8(입력창 아래 여백)을 빼 입력창과 툴바 사이를 16dp → 8dp로 맞춘다(사용자 지시). `bottomOffset` 식은 원래 내비게이션 모드와 상관없이 같은 간격이 나온다
- [x] 검증: 닉네임·섬 이름 화면, 게시글 상세(댓글·답글), 채팅방을 양쪽 기기에서 키보드 올림/내림 상태로 촬영

## Phase 4: 전체 확인과 문서화

- [x] 범위 제외 인풋 확인: 이슈 #58에 나열된 나머지 인풋을 Android에서 촬영해 세로 정렬 확인. 도달할 수 없는 화면은 "촬영 불가 — 이유"로 기록
- [x] `npm run lint`, `npm run typecheck` 통과
- [x] 함정 기록 (`agent_docs/architecture.md`의 키보드 항목 근처)
  - edge-to-edge + `KeyboardProvider` 환경의 Android는 창이 키보드에 맞춰 줄어들지 않으므로, RN 기본 `KeyboardAvoidingView`의 `'height'`·`undefined`에 기대면 안 된다는 점
  - `TextInput` 스타일의 `verticalAlign`은 `textAlignVertical`을 덮어쓴다는 점
  - 고정 `height`에 세로 `padding`을 함께 주면 Android에서 글자가 위로 치우친다는 점. 세로 padding을 빼기만 하면 Android 기본 세로 여백이 적용되므로 `paddingVertical: 0`을 명시해야 한다는 점

## 진행 기록

### 2026-11-14

- Phase 1 완료
- 검증: `npx tsc --noEmit` 통과, `npx eslint`(변경 파일 2개) 에러 0건(경고 2건은 변경 전부터 있던 것)
- 검증: 프로필 수정 모달의 닉네임·섬 이름·칭호(입력값)와 닉네임·섬 이름(placeholder)을 앱 재시작 후 촬영해 글자 중심과 박스 중심의 차이를 픽셀로 측정. iOS 0~0.5px(정중앙, 수정 전과 같음), Android 수정 전 위로 4.5~5.5px → 수정 후 아래로 3.5px(약 1.2dp)
- 검증: 회원가입 닉네임·섬 이름 화면은 직접 촬영하지 못함(로그인된 계정을 로그아웃하고 새 계정으로 가입해야 진입 가능). 같은 `NameInput` 스타일을 쓰므로 모달 측정 결과로 갈음
- 사용자 확인 사항: 키보드가 회원가입 화면 하단 버튼을 가리는 문제는 Phase 3(#59) 범위
- Phase 2 코드 변경 완료, Android 기기 검증 남음
- 검증: `npx tsc --noEmit` 통과, `npx eslint src/screens/NewPost.tsx` 에러 0건(경고 1건은 변경 전부터 있던 것)
- 검증: iOS 시뮬레이터(iPhone 17 Pro)에서 키보드 닫힘·열림 상태를 촬영해 Before와 비교. 버튼이 홈 인디케이터 위에 놓이고, 키보드가 열리면 버튼 영역은 키보드 뒤에 가려짐
- 검증: Android 실기기 3버튼 모드에서 키보드 닫힘·열림 상태를 촬영해 Before와 비교. 버튼 전체가 내비게이션 바 위로 올라오고, 키보드가 열리면 버튼 영역은 키보드 뒤에 가려짐(수정 전과 같음)
- 검증: 본문 placeholder 수정 후 Android 실기기(placeholder·두 줄 입력)와 iOS 시뮬레이터를 촬영. 양쪽 모두 박스 위쪽부터 표시됨
- 검증: Android 제스처 모드에서 키보드 닫힘·열림 상태를 촬영. 버튼 아래 끝이 내비게이션 바 영역 바로 위(2594px, 내비게이션 바는 2595px부터)에 붙고 제스처 핸들과 겹치지 않음. 키보드가 열리면 버튼 영역은 키보드 뒤에 가려짐
- 검증: Android 하단 여백 +8 적용 후 제스처 모드 재촬영. 버튼 아래 끝이 2594px → 2570px로 8dp 올라가 내비게이션 바와 약 8dp 띄워짐. `tsc` 통과, `eslint` 에러 0건
- 검증: 3버튼 모드로 되돌린 뒤 재촬영. 버튼 아래 끝 2471px, 내비게이션 바 2496px부터로 약 8dp 띄워짐
- Phase 2 완료
- 검증: `tsc` 통과, 변경한 세 파일 `eslint` 에러 0건(경고 1건은 변경 전부터 있던 것)
- 검증: Android 실기기(3버튼 모드)에서 닉네임·섬 이름 화면, 게시글 상세의 댓글·답글, 채팅방을 키보드가 열린 상태로 촬영. 모든 화면에서 버튼·인풋이 키보드 툴바 위에 보임. 회원가입 화면은 시작 화면을 임시로 바꿔 들어갔고 촬영 후 되돌림
- 검증: iOS 시뮬레이터에서 닉네임 화면을 촬영. 버튼이 툴바 바로 위에 보임. 게시글 상세는 시뮬레이터가 로그아웃 상태라 댓글 인풋이 비활성화되어 있어 확인하지 못함
- 결정: Android에서 iPhone보다 키보드 위로 더 올라간다는 사용자 확인에 따라 offset 계산식을 Android만 바꿈(A안). 원인은 화면에 실제 값을 띄워 확인함: 하단 inset이 iPhone 34dp, Android 3버튼 48dp
- 검증: Android 3버튼 모드에서 재촬영. 닉네임·섬 이름 버튼 아래 끝과 툴바 사이 28dp → 8dp, 댓글 인풋 영역과 툴바 사이 23dp → 약 9dp, 답글 모드도 툴바 위에 보임. `tsc` 통과, `eslint` 에러 0건
- 검증: 댓글·채팅 인풋 -8 적용 후 Android 제스처 모드에서 촬영. 입력창(회원가입은 버튼)과 툴바 사이 간격: 닉네임 8dp, 섬 이름 8dp, 댓글 7.7dp, 채팅 8dp. `tsc` 통과, `eslint` 에러 0건
- 검증: iOS 시뮬레이터 로그인 후 게시글 상세·채팅방을 키보드가 열린 상태로 촬영. 두 입력창 모두 툴바 위에 보임
- 결정: iOS 댓글·채팅 입력창과 툴바 사이(계산상 16dp)는 현재값을 유지한다(사용자 지시)
- Phase 3 완료
- 검증: `npm run lint` 에러 0건(경고 55건), `npm run typecheck` 통과
- 검증: Android 실기기(제스처 모드)에서 범위 제외 인풋을 촬영. 검색(입력 글자 중심 차이 0.5dp), 아이템 검색·주민 검색 placeholder, 아이템 수정 모달의 숫자 입력·드롭다운, 신고 모달 상세 내용, 댓글 수정 모달 모두 정상. 채팅·댓글 인풋은 Phase 3에서 확인
- 결정: 주민 선택 카드 이름이 Android에서 아래쪽이 잘리던 기존 문제를 이번에 함께 고친다(사용자 지시). `VillagerSelectItem`에 `minHeight: 100`을 더해 iPhone(카드 폭 100 이상)은 그대로 정사각형이다
- 검증: Android에서 주민 선택 모달을 다시 촬영해 이름이 잘리지 않음을 확인. `tsc` 통과, `eslint` 에러 0건
- 검증: iOS 시뮬레이터(iPhone 17 Pro)에서 주민 선택 모달을 촬영. 카드가 약 104dp 정사각형 그대로이고 이름도 잘리지 않음(모달을 바로 여는 임시 코드로 진입 후 되돌림)
- Phase 4 완료
- 전체 구현 완료

## 기기 확인

- [ ] Android: 회원가입 닉네임·섬 이름 화면에서 인풋 글자와 placeholder가 상자 세로 가운데에 보인다
- [ ] Android: 프로필 수정 모달의 닉네임·섬 이름·칭호 인풋 글자가 상자 세로 가운데에 보인다
- [ ] Android: 새 글 작성 하단 버튼이 내비게이션 바(3버튼·제스처 모두)에 가려지지 않고 약 8dp 위에 놓인다
- [ ] Android: 새 글 작성 본문 placeholder("내용을 입력하세요.")가 상자 위쪽부터 보인다
- [ ] Android: 회원가입 닉네임·섬 이름 화면에서 키보드를 열면 하단 버튼이 툴바("완료") 위 8dp에 보인다
- [ ] Android: 게시글 상세 댓글·답글 인풋과 채팅방 인풋이 키보드를 열면 툴바 위 8dp에 보인다
- [ ] Android: 분양·입양 글의 주민 선택 모달에서 주민 이름이 잘리지 않는다
- [ ] iOS: 위 화면들의 배치가 수정 전과 같다(새 글 작성 하단 버튼 여백 제외)

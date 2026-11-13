# Android 레이아웃 이슈 일괄 수정 (#58, #59, #60, #61)

> 이슈: GitHub #58, #59, #60, #61
> 작업 종류: 버그 수정
> 상태: 진행중
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

- [ ] 하단 버튼 영역에 하단 inset 여백 추가 (`src/screens/NewPost.tsx`의 `buttonContainer`)
  - 재사용: 이미 선언된 `const insets = useSafeAreaInsets()` (`NewPost.tsx:45`)
  - 패턴: 정적 스타일 `padding: PADDING`은 그대로 두고, 렌더링 시 `paddingBottom`만 `PADDING + insets.bottom`으로 덮어쓴다
  - 결정: iOS·Android 모두 적용한다(사용자 지시). 기존 여백은 플랫폼 공통 24 하드코딩이라 iOS도 홈 인디케이터에 약 10pt 걸쳐 있었고, 다른 화면처럼 하단 inset을 반영하도록 맞춘다. iOS 버튼은 34pt 위로 올라간다.
- [ ] 검증: 3버튼 내비게이션과 제스처 내비게이션 양쪽에서 촬영. 기기의 현재 모드는 3버튼(`navigation_mode=0`)이며, 제스처 모드 전환은 사용자에게 요청하고 끝나면 원래대로 되돌린다. 키보드를 올린 상태도 촬영한다.

## Phase 3: Android 키보드 회피 (#59, #61)

- [ ] 닉네임 입력 화면의 `KeyboardAvoidingView`를 keyboard-controller 버전으로 교체 (`src/screens/SignUpDisplayName.tsx`)
  - 재사용: `KeyboardAvoidingView` from `react-native-keyboard-controller` (1.20.7, 이미 설치됨. `EditCommentModal`·`EditProfileModal`은 같은 패키지의 `KeyboardAwareScrollView`를 사용 중)
  - 패턴: keyboard-controller의 KAV는 RN KAV와 같은 계산식(`frame.y + frame.height - (화면 높이 - 키보드 높이 - offset)`)을 쓰므로, iOS의 `behavior`와 `keyboardVerticalOffset`은 그대로 둔다. Android `behavior`는 `'padding'`으로 시작하고, 버튼 위치가 맞지 않으면 Android offset만 실측해서 조정한다.
- [ ] 섬 이름 입력 화면에 같은 변경 적용 (`src/screens/SignUpIslandName.tsx`)
- [ ] 게시글 상세의 댓글 인풋 `KeyboardAvoidingView`를 keyboard-controller 버전으로 교체 (`src/screens/PostDetail.tsx:307`)
  - 패턴: 위와 같다. 현재 Android는 `behavior='height'`인데, 감싼 View에 높이가 없으므로 `'height'`는 인풋을 줄이기만 한다. Android도 `'padding'`으로 바꾸고 offset을 실측한다.
- [ ] 채팅방 인풋 확인 (`src/screens/ChatRoom.tsx`) — 코드 변경은 문제가 보일 때만
  - 패턴: `react-native-gifted-chat` 2.8은 내부에서 keyboard-controller를 쓰므로 이미 정상일 가능성이 높다
- [ ] 검증: 닉네임·섬 이름 화면, 게시글 상세(댓글·답글), 채팅방을 양쪽 기기에서 키보드 올림/내림 상태로 촬영

## Phase 4: 전체 확인과 문서화

- [ ] 범위 제외 인풋 확인: 이슈 #58에 나열된 나머지 인풋을 Android에서 촬영해 세로 정렬 확인. 도달할 수 없는 화면은 "촬영 불가 — 이유"로 기록
- [ ] `npm run lint`, `npm run typecheck` 통과
- [ ] 함정 기록 (`agent_docs/architecture.md`의 키보드 항목 근처)
  - edge-to-edge + `KeyboardProvider` 환경의 Android는 창이 키보드에 맞춰 줄어들지 않으므로, RN 기본 `KeyboardAvoidingView`의 `'height'`·`undefined`에 기대면 안 된다는 점
  - 고정 `height`에 세로 `padding`을 함께 주면 Android에서 글자가 위로 치우친다는 점. 세로 padding을 빼기만 하면 Android 기본 세로 여백이 적용되므로 `paddingVertical: 0`을 명시해야 한다는 점

## 진행 기록

### 2026-11-14

- Phase 1 완료
- 검증: `npx tsc --noEmit` 통과, `npx eslint`(변경 파일 2개) 에러 0건(경고 2건은 변경 전부터 있던 것)
- 검증: 프로필 수정 모달의 닉네임·섬 이름·칭호(입력값)와 닉네임·섬 이름(placeholder)을 앱 재시작 후 촬영해 글자 중심과 박스 중심의 차이를 픽셀로 측정. iOS 0~0.5px(정중앙, 수정 전과 같음), Android 수정 전 위로 4.5~5.5px → 수정 후 아래로 3.5px(약 1.2dp)
- 검증: 회원가입 닉네임·섬 이름 화면은 직접 촬영하지 못함(로그인된 계정을 로그아웃하고 새 계정으로 가입해야 진입 가능). 같은 `NameInput` 스타일을 쓰므로 모달 측정 결과로 갈음
- 사용자 확인 사항: 키보드가 회원가입 화면 하단 버튼을 가리는 문제는 Phase 3(#59) 범위

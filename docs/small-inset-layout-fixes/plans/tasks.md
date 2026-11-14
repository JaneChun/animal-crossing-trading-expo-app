# 하단 inset이 작은 iOS 기기의 버튼·입력창 가려짐 수정 (PR #65 리뷰 후속)

> 이슈: 없음 (PR #65 리뷰 1·5·6번)
> 작업 종류: 버그 수정
> 상태: 대기
> 생성일: 2026-11-14

## 개요

PR #65(`fix/issue-58-61-android-layout`)에 달린 자동 리뷰를 검증하면서, iPhone SE(3세대, iOS 26.5, `insets.bottom` 0) 시뮬레이터에서 아래 3건을 직접 확인했다. 모두 하단 safe area inset(`insets.bottom`)이 iPhone 노치 기기의 34라고 가정한 식에서 생긴다.

- **새 글 작성 하단 버튼(리뷰 1번, 이번 PR의 회귀)**: `NewPost.tsx`가 `buttonContainer`의 `paddingBottom`을 `insets.bottom`(Android는 +8)으로 덮어쓴다. inset이 0인 기기에서는 아래 여백이 0이 되어 "아이템 추가"·"등록" 버튼이 화면 맨 아래에 붙는다. PR 이전에는 `padding: 24`로 여백이 24였다.
- **게시글 상세 댓글 입력창(리뷰 5번, 기존 코드)**: iOS `keyboardVerticalOffset`이 `headerHeight + insets.top + insets.bottom + 10`이다. SE에서 키보드를 열면 입력창이 툴바("완료") 뒤에 대부분 가려진다.
- **회원가입 닉네임·섬 이름(리뷰 6번, 기존 코드)**: iOS `keyboardVerticalOffset`이 `insets.bottom + KEYBOARD_TOOLBAR_HEIGHT + 12`다. SE에서 키보드를 열면 "다음" 버튼이 툴바 뒤에 가려진다.

목표는 SE와 노치 iPhone에서 버튼·입력창과 툴바 사이 간격이 같아지는 것이다. 노치 iPhone(iPhone 17 Pro)과 Android의 현재 모습은 바꾸지 않는다.

범위에서 제외하는 것:

- 리뷰 2번(SignUp Android 식의 `- 24` 하드코딩·중복), 3번(`LAYOUT_HEADER_HEIGHT` 실측 하드코딩), 4번(NewPost 폼의 RN 기본 KAV + Android `'height'`)은 이번 작업에 넣지 않는다. 다만 Phase 3에서 SignUp 식을 고치다가 두 파일의 식을 공통화하는 편이 자연스러우면 2번을 함께 처리해도 된다.
- 채팅방(`ChatRoom.tsx`)은 SE에서도 정상이다. `bottomOffset`에서 빼는 `insets.bottom`이 `SafeAreaView`의 하단 패딩을 상쇄하는 구조라 기기와 관계없이 위치가 같다. 손대지 않는다.

## Phase 1: 새 글 작성 하단 버튼 최소 여백

- [x] 하단 여백에 최솟값 적용 (`src/screens/NewPost.tsx`의 `buttonBottomPadding`)
  - 재사용: 같은 파일의 `PADDING` import(`@/components/ui/layout/Layout`, 값 24)와 `insets`
  - 패턴: `Math.max(Spacing.s, insets.bottom + (Platform.OS === 'android' ? 8 : 0))`. 기존 주석("Android는 버튼이 홈 제스처 영역에 붙지 않도록…")은 유지하고, 최솟값을 두는 이유(inset 0 기기)를 한 줄 더한다.
  - 결정: 하단 여백은 `insets.bottom` 기반을 유지하고, inset이 작은 기기에서만 최솟값으로 올린다(이전 계획 `docs/android-layout-fixes/plans/tasks.md` Phase 2의 사용자 결정을 따른다).
  - 결정: 최소 여백은 8(`Spacing.s`)이다(사용자 지시, SE에서 24를 확인한 뒤 변경). SE만 0에서 8로 바뀌고, 다른 기기는 계산값이 8보다 커서 현재 PR과 같다.
- [x] 검증: iPhone SE, iPhone 17 Pro, Android(3버튼·제스처) 새 글 작성 화면을 촬영해 버튼 아래 여백 확인

## Phase 2: iOS 키보드 offset 실측

계산상으로는 SignUp의 iOS 식이 inset과 무관해야 하는데(아래 패턴 참고) SE에서 실제로 가려졌다. 그래서 식을 고치기 전에 값을 먼저 잰다.

- [ ] KAV 계산에 들어가는 값을 임시로 로그에 출력 (`src/screens/SignUpDisplayName.tsx`, `src/screens/PostDetail.tsx`)
  - 패턴: keyboard-controller 1.20.7 KAV는 `padding = frame.y + frame.height - (screenHeight - keyboardHeight - keyboardVerticalOffset)`로 계산한다(`node_modules/react-native-keyboard-controller/lib/module/components/KeyboardAvoidingView/index.js:47-52`). `frame`은 KAV의 `onLayout` 값(부모 기준), `screenHeight`는 `useWindowDimensions().height`다.
  - 출력할 값: KAV `onLayout`의 `y`·`height`, `useWindowDimensions().height`, 키보드 높이(`useKeyboardHandler` 또는 `Keyboard` 이벤트), `insets.top`·`insets.bottom`, `headerHeight`
- [ ] iPhone SE와 iPhone 17 Pro에서 키보드를 연 상태로 값과 스크린샷을 기록하고, 버튼·입력창 아래 끝과 툴바 위 끝 사이 간격(dp)을 잰다. 결과는 `## 진행 기록`에 남긴다.
- [ ] 임시 로그 코드 제거

## Phase 3: 회원가입 iOS offset 식 수정

- [ ] iOS `keyboardVerticalOffset` 식에서 `insets.bottom` 의존 제거 (`src/screens/SignUpDisplayName.tsx:59-64`)
  - 패턴: Phase 2 실측값으로 식을 정한다. Android 식(`insets.top + KEYBOARD_TOOLBAR_HEIGHT - 24`)은 바꾸지 않는다.
- [ ] 같은 식을 섬 이름 화면에 반영 (`src/screens/SignUpIslandName.tsx:89-94`)
- [ ] 검증: iPhone SE와 iPhone 17 Pro에서 닉네임·섬 이름 화면 키보드 열림 상태 촬영. 17 Pro의 간격이 Phase 2 기록과 같고, SE가 17 Pro와 같은지 확인. Android는 코드 경로가 바뀌지 않았는지 diff로 확인

## Phase 4: 게시글 상세 iOS offset 식 수정

- [ ] iOS `screenKeyboardOffset` 식에서 `insets.bottom + 10` 제거 (`src/screens/PostDetail.tsx:47-53`)
  - 재사용: `LAYOUT_HEADER_HEIGHT`(`src/components/ui/layout/LayoutWithHeader.tsx:13`). 리뷰는 두 플랫폼 공통으로 `headerHeight + insets.top + LAYOUT_HEADER_HEIGHT`를 쓰고 Android에만 `- 8`을 두는 방식을 제안했다. Phase 2 실측값으로 이 식이 맞는지 확인한 뒤 적용한다.
  - 패턴: 식 위 주석 3줄("iOS는 하단 inset + 10(34 + 10)이 헤더 높이를 대신하고…")을 새 식에 맞게 고친다.
- [ ] 검증: iPhone SE와 iPhone 17 Pro에서 댓글·답글 입력창 키보드 열림 상태 촬영. 17 Pro의 간격이 Phase 2 기록과 같고, SE가 17 Pro와 같은지 확인

## Phase 5: 문서 정리

- [ ] 키보드 offset 함정 설명 갱신 (`agent_docs/architecture.md`의 "`keyboardVerticalOffset`은 KAV 부모의 화면상 Y 위치…" 항목)
  - 패턴: "iOS는 inset 34에서만 맞는다"는 서술을 실제로 바뀐 식과 Phase 2 실측 결과에 맞게 고친다.
- [ ] 이번 세션에서 찾은 환경 함정 기록 (`agent_docs/environment.md`)
  - Mac의 LAN IP가 사설 대역이 아니면(예: `192.169.x.x`) iOS ATS의 `NSAllowsLocalNetworking` 예외가 적용되지 않아, dev client가 "App Transport Security policy requires the use of a secure connection"으로 번들을 못 받는다. `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1`로 Metro를 띄우면 해결된다. `expo start --localhost`는 IPv6(`::1`)에만 바인딩되어 `127.0.0.1`로 붙는 앱이 연결하지 못한다.
  - `CI=1`로 띄운 Metro는 파일 감시가 꺼져 코드를 고쳐도 다시 번들하지 않는다(로그: "Metro is running in CI mode, reloads are disabled"). 백그라운드로 띄운 Metro에서 앱을 리로드할 때는 `ws://127.0.0.1:<포트>/message`에 `{"version":2,"method":"reload"}`를 보낸다.
  - Maestro의 XCUITest 드라이버가 iPhone SE(3세대) iOS 26.5 시뮬레이터에 연결되지 못하고(`127.0.0.1:<port>` 연결 실패 반복) 시뮬레이터가 종료되기도 했다.
- [ ] `npm run lint`, `npm run typecheck` 통과

## 진행 기록

### 2026-11-14

- 계획 작성. iPhone SE 시뮬레이터("iPhone SE PR65", 에뮬레이터 모드, Metro 8082)에서 리뷰 1·5·6번을 재현함
- 검증: `npm run typecheck` 통과, `npx eslint src/screens/NewPost.tsx` 에러 0건(경고 1건은 변경 전부터 있던 `useEffect` 의존성 경고)
- 검증: iPhone SE에서 버튼 아래 여백 8, iPhone 17 Pro에서 수정 전과 같은 여백을 사용자가 확인. Android는 촬영하지 않음(계산값 약 24·56이 최솟값 8보다 커서 결과가 바뀌지 않음)
- Phase 1 완료

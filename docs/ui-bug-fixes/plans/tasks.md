# UI 버그 수정 (#73–#78)

> 이슈: GitHub #73, #74, #75, #76, #77, #78
> 작업 종류: 버그 수정
> 상태: 완료
> 생성일: 2026-11-15

## 개요

출시 후 접수된 UI 버그 6건을 한 브랜치(`fix/ui-issues`)에서 수정한다. 새 글 작성 화면의 다크 모드 글자 색(#78)과 키보드 처리(#73, #74), Android 3버튼 내비게이션 바에 가려지는 영역(#75, #77), 프로필 수정 바텀시트의 스크롤(#76)이 대상이다.
데이터 정합성 이슈인 #68은 이번 범위에서 제외한다. 각 Phase는 이슈 단위로 나뉘며, Phase 하나가 커밋 하나에 대응한다.

## 확인 필요

- [ ] PR을 이슈 6건 묶음 1개로 올릴지, Phase별로 나눠 올릴지 — 구현 영향 없음

## Phase 1: 새 글 작성 입력 글자 색 (#78)

- [x] 제목·본문 입력 스타일에 테마 기본 글자 색을 지정한다 (`src/components/NewPost/PostForm.tsx`)
  - 패턴: `makeStyles`의 `input`에 `color: colors.text.primary`를 추가한다. `titleInput`은 `input`과 합쳐 쓰므로 따로 넣지 않는다.
  - 재사용: `src/components/Profile/NameInput.tsx`가 같은 방식(`input` 스타일에 `colors.text.primary`)으로 이미 다크 모드를 처리한다.
  - 결정: 공통 컴포넌트 `ValidationInput`은 고치지 않는다. 앱 전체 입력(`TextInput`·`BottomSheetTextInput`을 쓰는 12개 파일)을 검토한 결과, 글자 색이 지정되지 않은 곳은 `PostForm`의 제목·본문뿐이다. `NameInput`(프로필 수정·회원가입), `SearchInput`, `NumberInput`, `ReportModal`, `EditProfileModal`의 칭호·한마디는 `text.primary`, `EditCommentModal`은 `text.secondary`, `ChatInput`·`CommentInput`은 `text.tertiary`를 지정한다.
- [x] 검증: `npm run typecheck`, 다크·라이트 모드에서 마켓·커뮤니티 새 글 작성과 글 수정 화면 확인

## Phase 2: 새 글 작성 키보드 처리 (#73, #74)

- [x] `PostForm`의 스크롤 영역을 keyboard-controller의 `KeyboardAwareScrollView`로 바꾼다 (`src/components/NewPost/PostForm.tsx`)
  - 재사용: `src/components/Profile/EditProfileModal.tsx`가 `KeyboardAwareScrollView`에 `ScrollViewComponent`로 스크롤 구현체를 주입하고 `bottomOffset={KEYBOARD_TOOLBAR_HEIGHT + PADDING}`을 준다. 여기서는 기존 RNGH `ScrollView`를 `ScrollViewComponent`로 주입해 제스처 동작을 유지한다.
  - 패턴: `KeyboardAwareScrollView`는 포커스된 입력과 여러 줄 입력의 커서 위치를 따라 스크롤하므로 #73을 해결한다.
- [x] `NewPost`에서 RN 기본 `KeyboardAvoidingView`를 제거하고 `keyboardVerticalOffset` 계산과 관련 import를 정리한다 (`src/screens/NewPost.tsx`)
  - 패턴: `agent_docs/architecture.md` 25행에 따르면, Android edge-to-edge 환경에서는 RN 기본 KAV의 `behavior="height"`가 맞게 동작하지 않는다. KAV가 없어지면 하단 버튼 영역은 두 플랫폼 모두 화면 하단에 고정되고 키보드에 가려진다(#74).
  - 결정: 하단 버튼을 키보드 위로 올리지 않는다. 이슈 #74의 기대 동작(iOS와 같게 하단 고정)을 따른다.
- [x] `scrollViewRef` 타입이 `KeyboardAwareScrollView` ref와 맞는지 확인하고 필요하면 고친다 (`src/types/components.ts` 107행)
  - 패턴: `onError`의 `scrollToTop`이 `scrollViewRef.current?.scrollTo(0)`을 호출하므로 이 동작이 유지되어야 한다.
- [x] 검증: `npm run typecheck`, iOS·Android에서 `Boards`·`Communities` 새 글 작성 화면의 긴 본문 입력, 유효성 오류 시 맨 위 스크롤, 붙여넣기 아이템 추가 팝업 확인
- [x] `agent_docs/architecture.md`의 KAV 관련 기록에 `NewPost`가 `KeyboardAwareScrollView`로 바뀌었다는 점을 반영한다

## Phase 3: 액션 시트 하단 inset (#77)

- [x] Android에서 액션 시트 하단에 `insets.bottom`만큼 여백을 넣는 공통 훅을 만든다 (`src/hooks/shared/useSafeActionSheet.ts`)
  - 패턴: `@expo/react-native-action-sheet`의 `showActionSheetWithOptions` 옵션 `containerStyle`은 Android 커스텀 시트에만 적용되고, iOS는 네이티브 `ActionSheetIOS`를 쓰므로 영향이 없다. 훅은 `useActionSheet()`를 감싸 `containerStyle: { paddingBottom: insets.bottom }`을 합쳐 넘긴다.
  - 결정: 호출부가 4곳이라 각 호출부에 옵션을 복사하지 않고 훅 하나로 모은다.
- [x] 호출부 4곳의 `useActionSheet`를 새 훅으로 바꾼다 (`src/components/ui/ActionSheetButton.tsx`, `src/screens/ChatRoom.tsx`, `src/components/Profile/MyPosts.tsx`, `src/components/Profile/ProfileImageInput.tsx`)
  - 패턴: `ActionSheetProvider`가 `SafeAreaProvider` 바깥(`App.tsx` 125행)에 있지만, 호출부는 모두 `SafeAreaProvider` 안쪽이므로 훅 안에서 `useSafeAreaInsets()`를 쓸 수 있다.
- [x] 검증: `npm run typecheck`, Android 3버튼·제스처 모드에서 댓글·답글·게시글 상세·채팅방·프로필의 `⋮` 메뉴, 작성 글 게시판 선택 메뉴, 프로필 이미지 변경 메뉴 확인

## Phase 4: 스택에서 연 프로필의 목록 끝 여백 (#75)

- [x] 탭 밖(RootStack)에서 연 `Profile`에서만 목록 하단에 `insets.bottom` 여백을 준다 (`src/screens/Profile.tsx`)
  - 패턴: `Profile`은 `ProfileStackNavigator`(탭 안)와 `RootStackNavigator` 101행(탭 밖)에 함께 등록되어 있다. `@react-navigation/bottom-tabs`의 `BottomTabBarHeightContext`를 `useContext`로 읽으면 탭 밖에서는 `undefined`이므로, 이 값으로 탭 안팎을 구분한다.
  - 결정: 바깥 `FlatList`의 `contentContainerStyle.paddingBottom`만으로 Galaxy에서 목록 끝이 내비게이션 바 위에 보여 `PostList`는 고치지 않았다(실기기 확인).
  - 패턴: 바깥 `FlatList`(138행)는 `data={[]}`이고, 실제 글 목록은 `ListEmptyComponent` 안 `MyPosts` → `PostList`의 `FlatList`이며 `마지막 글입니다.`도 여기의 `ListFooterComponent`다. 바깥 `FlatList`의 `contentContainerStyle.paddingBottom`으로 먼저 시도하고, 기기에서 안쪽 목록이 따로 스크롤되어 효과가 없으면 `PostList`에 여백을 전달하는 방식으로 바꾼다.
  - 결정: 공통 `Layout`(사용처 28곳)은 고치지 않는다. 문제가 스택에서 연 `Profile`에만 있어 영향 범위를 좁힌다.
- [x] 검증: `npm run typecheck`, Android 3버튼 모드에서 댓글·채팅으로 연 프로필과 하단 탭 프로필의 목록 끝 비교, iOS 동일 확인

## Phase 5: 프로필 수정 바텀시트 입력창 위 드래그 스크롤 (#76)

- [x] Android에서 입력창 위에서 시작한 드래그가 스크롤로 이어지지 않는 원인을 기기에서 확인한다 (`src/components/Profile/EditProfileModal.tsx`)
  - 패턴: 입력은 Gorhom `BottomSheetTextInput`, 스크롤은 `KeyboardAwareScrollView`에 주입한 `BottomSheetScrollView`(RNGH 기반)다. 시트는 `contentHandlesKeyboard`로 키보드 여백을 `KeyboardAwareScrollView`에 맡긴다.
  - 패턴: 첫 가설은 RNGH 스크롤 제스처가 Android `EditText`의 터치를 넘겨받지 못한다는 것이다. 먼저 `BottomSheetTextInput`을 RN 기본 `TextInput`으로 바꿔 차이를 확인한다. 이 시트는 키보드 여백을 `KeyboardAwareScrollView`가 처리하므로, 바꿔도 키보드 동작이 유지되는지 함께 본다.
- [x] 확인한 원인에 맞춰 수정한다 (`src/components/Profile/EditProfileModal.tsx`, `src/components/Profile/NameInput.tsx`)
  - 결정: `EditProfileModal`의 입력 5개를 RN 기본 `TextInput`으로 바꾼다. `NameInput`은 `InputComponent`로 받으므로 고치지 않는다(Galaxy에서 드래그 스크롤·포커스·키보드 위치·시트 높이 복원 확인).
- [x] 같은 구조인 시트에 같은 수정을 적용한다 (`src/components/PostDetail/EditCommentModal.tsx`, `src/components/PostDetail/ReportModal.tsx`)
  - 결정: 두 시트 모두 바꾸지 않는다(실기기 확인). `EditCommentModal`은 RN `TextInput`으로 바꾸면 여러 줄 입력의 커서가 키보드 아래로 내려가고, `ReportModal`은 Gorhom 키보드 처리에 `BottomSheetTextInput`이 필요하다.
- [x] 원인과 해결 방식을 `agent_docs/architecture.md`의 바텀시트 기록에 추가한다
- [x] 검증: `npm run typecheck`, Android에서 닉네임·섬 이름·칭호·한마디 입력창 위 드래그 스크롤, 드래그 후 포커스 이동 없음, 키보드 위 입력 위치 확인, iOS 동일 확인

## 진행 기록

### 2026-11-15

- Phase 1 완료
- 검증: `npm run typecheck` 통과, Galaxy(SM-F711N)·iPhone 13 mini 실기기 다크 모드 확인(사용자)
- Phase 2 완료
- 검증: `npm run typecheck` 통과, lint 신규 경고 없음, Galaxy·iPhone 실기기에서 마켓·커뮤니티 새 글 작성 키보드 동작 확인(사용자)
- 결정: iOS 새 글 작성 본문 커서 어긋남(행간 26)은 보류(사용자 지시). 행간 유지와 커서 정렬을 함께 맞추려면 React Native iOS 네이티브 패치가 필요하다.
- Phase 3 완료
- 검증: `npm run typecheck` 통과, Galaxy 3버튼·제스처 모드에서 액션 시트 확인(사용자)
- Phase 4 완료
- 검증: `npm run typecheck` 통과, Galaxy 3버튼 모드·iPhone에서 스택 프로필·탭 프로필 목록 끝 확인(사용자)
- 결정: Android 댓글 수정 시트의 입력칸 안 스크롤은 별도 이슈로 분리(사용자 지시)
- Phase 5 완료
- 검증: `npm run typecheck` 통과, Galaxy·iPhone에서 프로필 수정 시트 입력창 위 드래그 스크롤·포커스·키보드 위치 확인(사용자)
- 전체 구현 완료

## 기기 확인

- [x] 다크 모드에서 마켓·커뮤니티 새 글 작성과 글 수정의 제목·본문을 입력하면 글자가 밝은 색으로 보인다
- [x] 새 글 작성에서 긴 본문을 입력하면 커서를 따라 스크롤되고, 하단 버튼은 키보드에 가려졌다가 키보드를 내리면 원래 자리에 보인다
- [x] Android 3버튼·제스처 모드에서 `⋮`·게시판 선택·프로필 이미지 변경 액션 시트의 마지막 항목이 내비게이션 바 위에 보인다
- [x] 댓글·채팅에서 연 프로필의 작성 글을 끝까지 내리면 `마지막 글입니다.`가 내비게이션 바 위에 보인다
- [x] Android 프로필 수정 시트에서 입력창 위를 끌면 시트가 스크롤되고 포커스는 옮겨 가지 않는다

# 프로필

## 프로필 수정 바텀시트

- `EditProfileModal`처럼 입력 폼이 긴 `CustomBottomSheet`에서는 
  `BottomSheetScrollView`와 `BottomSheetTextInput`을 함께 사용한다. 
  일반 `ScrollView`/`TextInput`으로 바꾸면 바텀시트가 스크롤 제스처와 포커스된 입력을 추적하지 못해 
  하단 콘텐츠 또는 키보드 뒤 콘텐츠에 접근할 수 없게 된다.
- 포커스된 입력을 키보드 위로 자동 스크롤하려면 
  `react-native-keyboard-controller`의 `KeyboardAwareScrollView`로 감싸고 `ScrollViewComponent`에 `BottomSheetScrollView`를 넘긴다.
  Gorhom의 `BottomSheetScrollView`는 `useImperativeHandle`로 내부 `Reanimated.ScrollView` 인스턴스를 그대로 노출하므로, 
  controller가 `findNodeHandle`로 스크롤 타깃을 매칭하고 worklet `scrollTo`를 실행할 수 있다. 
  포커스 감지는 네이티브 레벨(`useReanimatedFocusedInput`) 이라 입력마다 `onFocus`를 배선할 필요가 없다. 
  Gorhom `BottomSheetScrollView`를 직접 쓰면 이 자동 스크롤이 사라지므로 주의한다.
- 시트 내용의 높이와 하단 여백은 `CustomBottomSheet`가 맡는다(`agent_docs/architecture.md`의 바텀시트 항목 참고).
  화면 하단 inset(탭 밖에서 열 때의 홈 인디케이터·내비게이션 바)도 시트가 비워 주므로, body에 탭바 높이를 더하지 않는다(#57에서 제거).
- 키보드 하단 여백은 `KeyboardAwareScrollView`가 전담한다. 그래서 `CustomBottomSheet`에 `contentHandlesKeyboard`를 넘겨 시트가 키보드만큼 내용 높이를 줄이지 않게 한다(줄이면 끝까지 스크롤했을 때 빈 공간이 키보드 높이만큼 더 생긴다).
  키보드가 열리면 controller가 내부 스페이서로 키보드 프레임 높이만큼 여백을 주입하므로, 스크롤 콘텐츠에는 정적 `PADDING`만 두고 `useKeyboardState()` 기반 동적 패딩을 더하지 않는다(더하면 이중 여백).
  `bottomOffset`에는 키보드 툴바 높이와 여백(`KEYBOARD_TOOLBAR_HEIGHT + PADDING`)을 주어 포커스 입력이 툴바에 가리지 않게 한다.
- 스크롤 폼의 세로 래퍼는 `flexShrink: 0`으로 둔다.
  래퍼가 뷰포트 높이에 맞춰 줄어들면 자식은 화면 밖에 그려지면서도 스크롤 가능한 콘텐츠 높이에는 포함되지 않을 수 있다.
- 스크롤 폼은 `['95%', '100%']` 스냅 포인트를 사용한다.
  95%로 열어 상단에 닫기 여백을 남기고, 위로 끌면 100%까지 확장된다.

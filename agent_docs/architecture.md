# 아키텍처

## 상태 관리 매핑

| 종류 | 도구 → 위치 |
|------|-------------|
| 서버 상태 | React Query → `src/hooks/{domain}/query`, `mutation` |
| 전역 상태 | Zustand → `src/stores/{domain}/` |
| 폼 상태 | React Hook Form + Zod → `src/hooks/{domain}/form/` |
| URL/딥링크 | React Navigation `linking` → `App.tsx` |

## 진입점 (`App.tsx`)

Provider 중첩 구조와 초기화 훅 목록은 `App.tsx`를 직접 읽고 파악할 것. 지켜야 할 제약:

- 초기화 훅은 인증(`useAuthInitializer`)이 가장 먼저 — 새 구독/초기화 훅은 인증 이후 순서를 지켜 추가.
- React Query 컨텍스트에 의존하는 구독 훅(알림·채팅 등)은 `QueryClientProvider` 하위인 `AppContent`에서 실행해야 함.
- **스플래시 표시/해제는 `RootStackNavigator`의 `isAppInitializing` 분기가 단일 소유** (`src/navigation/RootStackNavigator.tsx:45`) — 개별 훅에서 스플래시를 제어하지 말 것. 단, 이는 **JS 레벨 `SplashScreen` 컴포넌트** 얘기다. `App.tsx`의 `ExpoSplashScreen.hide()`(dev 전용)는 **네이티브 스플래시**로 별개 — 둘을 혼동해 한쪽을 "고치지" 말 것.
- React Query 기본 설정(staleTime 등)은 `App.tsx`의 QueryClient 생성부 참조.
- 전역 `KeyboardToolbar`는 화면 레이아웃을 확보하지 않는 오버레이다. 툴바 높이는 `KEYBOARD_TOOLBAR_HEIGHT`로 관리하고, `KeyboardAvoidingView`의 `keyboardVerticalOffset` 또는 `GiftedChat`의 `bottomOffset`에 더해 입력 영역이 가려지지 않게 한다. `CustomBottomSheet`는 `useGenericKeyboardHandler`로 툴바 높이만큼 하단 공간을 확보한다. `useReanimatedKeyboardAnimation`은 Android 입력 모드를 `adjustResize`로 변경해 Gorhom의 키보드 처리와 충돌할 수 있으므로 바텀시트에서 사용하지 않는다.
- iOS 앱 시작 시 키보드가 순간적으로 노출되는 것을 막기 위해 `KeyboardProvider`의 `preload={false}`를 유지한다.

## 주요 패턴

- **도메인 중심 훅 구조**: `src/hooks/{domain}/{query|mutation|form}/` (예: `src/hooks/post/query/useInfinitePosts.ts`)
- **Zustand 스토어 모듈 구조**: `src/stores/auth/` 구조를 따를 것. 초기화는 `App.tsx`에서 `use{Domain}Initializer` 훅으로 호출.
- **검색은 Algolia 쿼리 훅**: `useSearchPosts.ts`, `useSearchItems.ts`
- **Android 푸시 채널**: 앱은 `registerForPushNotificationsAsync`에서 `default` 채널(이름 `알림`)을 권한 요청 전에 만들고, 서버(`functions/src/utils/pushNotification.ts`)는 모든 푸시에 `channelId: 'default'`를 지정한다. 서버에서 `channelId`를 빼면 `expo-notifications`가 `Miscellaneous` 기본 채널로 표시해 `알림` 채널 설정이 적용되지 않는다. 채널을 추가할 때는 앱과 서버를 함께 바꿀 것.
- **채팅 알림은 `activeChatRoomId`가 같으면 보내지 않는다** (`functions/src/notifications/chat.ts`): 앱은 `useChatPresence`에서 채팅방 진입·포그라운드 복귀 때 방 ID를, 이탈·백그라운드 전환 때 `''`를 Firestore에 쓴다. 채팅방을 보던 중 최근 앱 목록에서 앱을 밀어 종료하면 백그라운드 전환 후 약 0.4초 만에 프로세스가 죽어 `''` 쓰기가 끝나지 않을 수 있고, 그러면 앱을 다시 열 때까지 그 방의 푸시가 오지 않는다(2026-11 Android 실기기에서 확인, iOS도 같은 구조). 미해결이며, 고치려면 서버가 저장 시각을 함께 보고 오래된 값을 무시하는 식의 변경이 필요하다. 푸시 수신 테스트는 채팅방이 아닌 화면에서 앱을 종료한 뒤 한다.
- **앱 종료 상태(콜드 스타트)의 알림 탭은 응답 리스너가 아니라 `linking.getInitialURL`이 처리한다** (전체 흐름은 `src/stores/push/notificationResponse.ts` 상단 주석): Android는 이 경우 `addNotificationResponseReceivedListener`가 호출되지 않고, iOS는 보관해 둔 응답을 리스너 등록 시 다시 전달한다. 그래서 `getInitialURL`이 `getLastNotificationResponse()`(SDK 55에서 `…Async` 버전은 deprecated)의 `url`을 첫 화면 주소로 쓰고, 리스너는 앱 시작 시점의 응답 ID와 같은 응답을 건너뛰어 iOS 중복 이동을 막는다. 시작 중에는 `RootStackNavigator`가 스플래시를 그려 화면이 등록되지 않으므로, 콜드 스타트 이동을 리스너의 `Linking.openURL`로 바꾸지 말 것. 실행 중(포그라운드·백그라운드) 탭은 리스너가 처리한다.
- **Android에서 헤더 표시 여부를 바꾸면서 같은 순간에 그 화면을 pop하면 크래시한다**: `react-native-screens` 4.23 + Fabric에서 `ScreenStackHeaderConfig`가 이미 스택에서 떨어진 화면을 갱신하며 `IllegalStateException: ScreenStackFragment added into a non-stack container`가 난다(JS 로그에는 안 남고 logcat에만 남는다). 그래서 `RootStackNavigator`의 로딩 중 헤더 숨김(`headerShown`)은 iOS에만 적용한다. 화면 옵션을 상태에 따라 바꾸는 코드를 추가할 때 같은 패턴을 피할 것.
- **게시글 상태 필터**: 조회 시 `where('status', 'not-in', ['hidden', 'deleted'])`로 숨김/삭제 게시글 제외 (`useInfinitePosts.ts`)

## 네비게이션

- 화면 밖 네비게이션은 `src/navigation/RootNavigation.ts`의 `navigationRef` 사용.

# ATT 권한 팝업 미표시 수정

> 이슈: 없음
> 작업 종류: 버그 수정
> 상태: 진행중
> 생성일: 2026-11-19

## 개요

App Store 심사에서 Guideline 2.1로 반려되었습니다. 심사 기기(iPadOS 27.2.1)에서 App Tracking Transparency(ATT) 권한 팝업을 찾을 수 없다는 사유입니다.

원인은 앱 실행 직후 `App.tsx`에서 ATT 요청(`useAdMobInitializer`)과 알림 권한 요청(`usePushNotificationInitializer`)이 같은 시점에 나가는 데 있습니다. 알림 팝업이 먼저 뜨면 앱이 `inactive` 상태가 되고, 그 상태에서 들어간 ATT 요청은 팝업 없이 `notDetermined`로 끝납니다. 앱이 아직 `active`가 되기 전인 실행 직후에 요청해도 같은 현상이 생깁니다. 또한 ATT 응답을 받기 전에 Firebase Analytics 이벤트가 전송되므로, "추적 데이터를 수집하기 전에 요청해야 한다"는 조건도 충족하지 못합니다.

이번 작업에서는 실행 초기에 필요한 권한·SDK 처리를 새 훅 `useStartupPermissions` 하나로 모읍니다. 이 훅은 ATT 요청 → Analytics 수집 시작 → AdMob 초기화 → 알림 권한 요청을 순서대로 실행합니다. 기존 광고·푸시 초기화 훅에서는 이 순서에 속한 처리를 빼냅니다. 사진·카메라 권한은 첫 실행 흐름과 관계없으므로 범위에서 제외합니다.

## Phase 1: ATT 요청 유틸과 Analytics 수집 설정

검증: `npm run typecheck`, `npm run lint` 통과.

- [x] ATT 요청 유틸 신설 (`src/utilities/trackingPermission.ts`)
  - `requestTrackingPermission()`: 앱이 `active`가 될 때까지 기다린 뒤 1초 지연하고 `requestTrackingPermissionsAsync()`를 호출합니다.
  - 지연 중에 앱이 백그라운드로 가면 다시 `active`가 될 때까지 기다린 뒤 요청합니다.
  - Android와 ATT를 지원하지 않는 환경에서는 바로 반환합니다.
  - 요청이 실패해도 예외를 밖으로 던지지 않습니다. 실패 때문에 이후 단계가 멈추면 안 됩니다. `__DEV__`에서는 결과 상태와 오류를 로그로 남깁니다(기존 `console.log('ATT permission status:')` 유지).
  - 패턴: `src/utilities/registerForPushNotificationsAsync.ts` (권한 요청 유틸을 `utilities/`에 두는 기존 방식)
  - 재사용: `expo-tracking-transparency`의 `requestTrackingPermissionsAsync`, `isAvailable` (`node_modules/expo-tracking-transparency/build/TrackingTransparency.d.ts:77,100`)
  - 결정: 요청 시점은 `active` 확인 후 1초 지연 (사용자 지시). 온보딩 화면 렌더와는 연동하지 않습니다.
- [x] 네이티브 Analytics 자동 수집 기본값을 끔 (`firebase.json`에 `"react-native": { "analytics_auto_collection_enabled": false }` 추가)
  - 이 설정이 없으면 `first_open`, `session_start`가 JS 실행 전에 네이티브에서 바로 전송됩니다.
  - 결정: Analytics 수집을 ATT 응답 뒤로 미룸 (사용자 지시).
- [x] 수집 시작 함수 추가 (`src/utilities/analytics.ts`)
  - `enableAnalyticsCollection()`: `analytics().setAnalyticsCollectionEnabled(true)`를 호출합니다. ATT를 거부해도 IDFA 없는 수집은 허용되므로 응답과 관계없이 켭니다.
  - 패턴: 같은 파일의 `log()`처럼 `.catch(() => {})`로 실패를 삼킵니다.

## Phase 2: 실행 초기화 훅으로 순서 일원화

검증: typecheck·lint 통과. iOS 개발 빌드에서 앱을 삭제하고 다시 설치했을 때 ATT 팝업 → 알림 팝업이 하나씩 뜨는지 확인합니다.

- [x] 실행 초기화 훅 신설 (`src/hooks/shared/useStartupPermissions.ts`)
  - 한 `useEffect` 안에서 `requestTrackingPermission()` → `enableAnalyticsCollection()` → `mobileAds().initialize()` → `registerForPushNotificationsAsync()` 순서로 await합니다.
  - 받은 푸시 토큰은 `usePushNotificationStore`의 `setExpoPushToken`에 저장하고, 오류는 `setError`에 저장합니다.
  - 결정: 언마운트 플래그(`isMounted`)는 두지 않음 — 앱 루트에서만 호출해 언마운트되지 않고 저장 대상도 전역 스토어라서 (사용자 지시)
  - AdMob 초기화 실패는 `__DEV__` 경고만 남기고 다음 단계로 넘어갑니다(기존 `src/stores/ads/initializer.ts:34-44` 동작 유지).
  - 패턴: `src/hooks/shared/useAppLifecycle.ts` (App.tsx에서 호출하는 공용 훅 위치)
- [x] 광고 초기화 훅 삭제 (`src/stores/ads/initializer.ts`, `src/stores/ads/index.ts`)
  - ATT 요청, `mobileAds().initialize()`, 광고 설정 반영을 모두 `useStartupPermissions`로 옮깁니다.
  - 결정: 광고 설정은 AdMob 초기화 뒤에 반영 — 반영 즉시 홈 목록이 네이티브 광고를 요청하기 때문 (리뷰 지적)
- [x] 푸시 초기화 훅에서 토큰 등록을 제거 (`src/stores/push/initializer.ts:28-31`)
  - 알림 핸들러 설정과 리스너 등록(`addNotificationReceivedListener`, `addNotificationResponseHandler`)은 그대로 남깁니다. 알림을 탭해 앱을 연 경우의 처리가 ATT 응답을 기다리면 안 되기 때문입니다.
  - `registerForPushNotificationsAsync` import 등 이번 변경으로 쓰이지 않게 된 코드를 정리합니다.
- [x] `App.tsx`에서 `useAdMobInitializer()` 호출을 `useStartupPermissions()`로 교체합니다
- [x] ATT 응답 전에 호출되는 `logLaunchAppOpen()`(`src/hooks/shared/useAppLifecycle.ts:13`)과 첫 `logScreenView()`가 수집이 꺼져 있어 버려지는지 확인하고 진행 기록에 남깁니다

## Phase 3: 실기기 검증과 문서 기록

- [ ] iPad와 iPhone 실기기에서 새로 설치하고 다음을 확인합니다: 온보딩 위에 ATT 팝업 → 알림 팝업 순서, ATT 허용·거부 각각 이후 광고 표시, 로그인 후 푸시 토큰이 Firestore에 저장되는지
- [ ] 설정 > 개인정보 보호 > 추적에서 권한을 초기화한 뒤 다시 실행해 팝업이 뜨는지 확인합니다
- [ ] 릴리스 빌드(에뮬레이터 모드)에서 Firebase DebugView로 ATT 응답 전에 이벤트가 없는지 확인합니다
- [x] 원인과 제약을 agent_docs에 기록합니다 (`agent_docs/architecture.md`의 App.tsx 초기화 제약 부분): "시스템 권한 팝업은 동시에 요청하지 않는다, ATT는 `active` 상태에서만 표시된다, 실행 초기 권한 순서는 `useStartupPermissions`에서만 관리한다"
- [ ] 심사 제출용 화면 녹화 촬영 (사용자 작업): 새로 설치 → ATT 팝업 → 이후 흐름

## 진행 기록

### 2026-11-19

- 결정: 실행 초기 권한·SDK 처리 순서를 `useStartupPermissions` 한 곳에서 관리 — 광고·푸시 훅에 나뉘면 순서 의존성이 숨겨지기 때문 (사용자 지시)
- 결정: 강제 업데이트 모달이 떠 있어도 권한 요청은 미루지 않음 — 심사 빌드는 최신 버전이라 영향 없음
- Phase 1 완료
- 검증: `npx tsc --noEmit`, `npx eslint`(변경 파일) 통과
- Phase 2 완료
- 검증: `npx tsc --noEmit`, `npx eslint`(변경 파일), `npx jest --selectProjects unit`(65개) 통과. 실기기 확인은 Phase 3에서 진행
- 결정: 푸시 토큰 저장 누락 우려는 해소됨 — `usePushNotificationInitializer`가 선택자 없이 `usePushNotificationStore()`를 구독해 토큰이 바뀌면 `App`이 리렌더되고, `useAuthInitializer`가 새 토큰을 읽음
- Analytics: `setAnalyticsCollectionEnabled(true)`는 다음 실행에도 유지되므로, 수집이 꺼진 채 버려지는 이벤트는 첫 실행의 ATT 응답 전 이벤트(`app_open_custom` cold_start 등)뿐임. `first_open` 기록 여부는 DebugView로 확인 필요
- 리뷰(서브에이전트) 반영: 광고 설정 반영을 AdMob 초기화 뒤로 이동(ATT 응답 전 홈 네이티브 광고 요청 회귀 수정), `undetermined`면 1회 재요청, 이미 응답한 사용자는 대기 생략, AdMob 초기화와 알림 권한 요청 병렬화
- 결정: `useAdMobInitializer` 삭제 — 광고 설정 반영까지 `useStartupPermissions`로 옮겨 남는 역할이 없음 (사용자 승인)
- 검증: `npx tsc --noEmit`, `npx eslint`(변경 파일, 기존 경고 6건 외 없음), `npx jest --selectProjects unit`(65개) 통과
- 검증(iPad Air 11 시뮬레이터, iOS 26.5, 기존 개발 빌드 + 8082 Metro, Maestro로 조작):
  - 새로 설치 → 온보딩 위에 ATT 팝업이 단독으로 표시됨, 1회차 요청에서 응답 받음
  - 허용: `granted` → Analytics 활성화 → `AdMob SDK initialized` 순서로 로그 확인
  - 재실행: ATT 요청 없이 바로 AdMob 초기화
  - 재설치 후 거부: `denied` → AdMob 초기화 진행
- 블로커: Xcode 26.4에 iOS 26.4 플랫폼이 없어 새 네이티브 빌드 불가 — `firebase.json` 자동 수집 비활성화(Info.plist 반영)는 미검증
- 시뮬레이터는 `Device.isDevice`가 false라 알림 권한 팝업이 뜨지 않음 — ATT → 알림 팝업 순서는 실기기에서만 확인 가능


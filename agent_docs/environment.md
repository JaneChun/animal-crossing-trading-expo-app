# 환경 설정

## 설치

- **Node 22**, 패키지 매니저는 npm
- 최초 설정: `npm install`(루트) → `cd functions && npm install`
- `.npmrc`에 `legacy-peer-deps=true` — peer 충돌을 무시하고 설치 (CI의 `npm ci`에도 동일 적용)
- 라이브러리 수정은 직접 수정 대신 `patch-package` 사용 (`patches/`, postinstall에서 자동 적용)

## 환경 변수 (git 미추적)

- `.env`:
  - Firebase: `EXPO_PUBLIC_API_KEY`, `EXPO_PUBLIC_AUTH_DOMAIN`, `EXPO_PUBLIC_PROJECT_ID`, `EXPO_PUBLIC_STORAGE_BUCKET`, `EXPO_PUBLIC_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_APP_ID`, `EXPO_PUBLIC_MEASUREMENT_ID`
  - Algolia: `EXPO_PUBLIC_ALGOLIA_APP_ID`, `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY`
  - 소셜 로그인: `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`, `EXPO_PUBLIC_NAVER_CLIENT_ID`, `EXPO_PUBLIC_NAVER_SECRET` 등
  - AdMob/EAS: `EXPO_PUBLIC_ADMOB_IOS_APP_ID`, `EXPO_PUBLIC_EAS_PROJECT_ID`, `GOOGLE_SERVICE_INFO_PLIST`
- `.env.local` (에뮬레이터용): `EXPO_PUBLIC_USE_FIREBASE_EMULATOR`, `EXPO_PUBLIC_FIREBASE_*_EMULATOR_HOST`
- `GoogleService-Info.plist`, `google-services.json`도 git 미추적

## Expo SDK 54 빌드 제약 (2026-07, 52→54 업그레이드에서 확인)

- **SDK 업그레이드 후 dev client 재빌드 필수** — 구 네이티브 dev client로 새 번들을 열면 "App entry not found" 크래시. `expo run:ios`(로컬) 또는 `npm run build:ios:dev`(EAS)로 재빌드.
- **Metro package exports 비활성 유지** — SDK 53+ 기본 활성화지만 Firebase JS SDK v10과 비호환. `metro.config.js`의 `unstable_enablePackageExports = false`는 Firebase v12+ 업그레이드 전까지 유지.
- **tsconfig에서 `moduleResolution` 오버라이드 금지** — `expo/tsconfig.base`의 `customConditions`와 충돌(TS5098).
- **RNFB(@react-native-firebase)는 프리컴파일 React-Core와 non-modular header 충돌** — expo-build-properties ios의 `forceStaticLinking: ['RNFBApp', 'RNFBAnalytics']`로 해결 (expo/expo#39607).
- **프리컴파일 React-Core + `useFrameworks: static`은 런타임 크래시** — 빌드는 성공하나 앱 시작 시 "AccessibilityManager is nil" 네이티브 예외로 "App entry not found" 표시. `buildReactNativeFromSource: true`로 코어를 소스 빌드해 해결. 단 이 옵션은 fmt/folly 프리빌드까지 꺼서 fmt 11 컴파일이 실패하므로 pod install 시점에 `RCT_USE_RN_DEP=1` 필요 — 로컬은 `RCT_USE_RN_DEP=1 npx expo prebuild --clean -p ios`, EAS는 eas.json 각 프로필 `env`에 설정돼 있음.
- **`expo run:ios`는 시뮬레이터 검증에 부적합** — 실기기 연결 시 실기기를 기본 타깃으로 잡고, Xcode 26.6에서는 devicectl 출력 파싱 실패로 시뮬레이터까지 실기기로 오인해 서명 오류로 실패. 시뮬레이터 빌드는 xcodebuild 직접 사용(`-destination "platform=iOS Simulator,name=..."`).

## 시뮬레이터/dev 서버 함정

- **dev client가 리로드/재접속 후 스플래시에서 멈추면 네이티브 문제부터 의심** (2026-07, RN 0.81 New Architecture) — JS 로그가 정상이면 `isAppInitializing` 등 JS 초기화 버그로 오진하지 말 것. 확인된 원인 3가지: ① TurboModule 초기화 데드락(이 앱에 대한 `simctl launch/terminate`까지 무한 대기), ② Fabric 서페이스 마운트 실패(`xcrun simctl io booted screenshot`으로 화면 확인), ③ expo-splash-screen auto-hide 옵저버 소실(CDP에서 `globalThis.expo.modules.ExpoSplashScreen.hide()` 호출 시 화면이 나오면 확정). 복구는 공통 — 호스트에서 앱 프로세스 `kill -9` 후 재실행(`simctl terminate`는 같이 멈출 수 있어 소용없음).
- **포트 8081을 이전 세션의 `expo start`가 점유하면** 새 dev 서버가 8082로 밀리거나 앱이 엉뚱한 서버에 붙음. `lsof -iTCP:8081 -sTCP:LISTEN`으로 확인 후 정리.
- **SDK 54: 셸에서 준 `EXPO_PUBLIC_*` 변수를 env 파일 값이 덮어씀** — `.env.local`에 같은 키가 있으면 셸 주입 값이 무시됨(`--clear`로도 해결 안 됨). `npm run dev:emulator`가 조용히 **프로덕션 Firebase에 붙을 수 있으므로**, 셸로 주입하는 키는 `.env.local`에서 제거. 검증: 번들에서 `grep -o 'EXPO_PUBLIC_USE_FIREBASE_EMULATOR": "[a-z]*"'`.

## 참고

- 포맷팅·린트·타입체크는 pre-commit 훅이 강제함 (`.husky/pre-commit`) — 수동으로 스타일을 맞추려 하지 말 것

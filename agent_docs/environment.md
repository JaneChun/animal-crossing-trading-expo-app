# 환경 설정

## 설치

- **Node 22**, 패키지 매니저는 npm
- 최초 설정: `npm install`(루트) → `cd functions && npm install`
- `.npmrc`에 `legacy-peer-deps=true` — peer 충돌을 무시하고 설치 (CI의 `npm ci`에도 동일 적용)
- 라이브러리 수정은 직접 수정 대신 `patch-package` 사용 (`patches/`, postinstall에서 자동 적용)
- 에디터가 TypeScript 6 이상을 쓰면 테스트 파일의 `jest.mock` 등에 `Cannot use namespace 'jest' as a value`(TS2708)가 표시된다. TS 6부터 `types` 기본값이 `[]`라 `@types/jest` 전역이 자동으로 로드되지 않기 때문이다. 프로젝트 기준은 `typescript ~5.9`(`npm run typecheck`)이므로 에디터에서 "Use Workspace Version"을 선택한다

## 환경 변수 (git 미추적)

- `.env`:
  - Firebase: `EXPO_PUBLIC_API_KEY`, `EXPO_PUBLIC_AUTH_DOMAIN`, `EXPO_PUBLIC_PROJECT_ID`, `EXPO_PUBLIC_STORAGE_BUCKET`, `EXPO_PUBLIC_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_APP_ID`, `EXPO_PUBLIC_MEASUREMENT_ID`
  - Algolia: `EXPO_PUBLIC_ALGOLIA_APP_ID`, `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY`
  - 소셜 로그인: `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`, `EXPO_PUBLIC_NAVER_CLIENT_ID`, `EXPO_PUBLIC_NAVER_SECRET` 등
  - AdMob/EAS: `EXPO_PUBLIC_ADMOB_IOS_APP_ID`, `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_EAS_PROJECT_ID`, `GOOGLE_SERVICE_INFO_PLIST`, `GOOGLE_SERVICES_JSON`(상대 경로 `./google-services.json`)
  - iOS 서명: `APPLE_TEAM_ID` — 로컬 실기기 빌드용. 없으면 prebuild가 `DEVELOPMENT_TEAM`을 비워 Xcode에서 "requires a development team" 오류. EAS Build는 자체 자격 증명으로 서명하므로 불필요
- `.env.local` (에뮬레이터용): `EXPO_PUBLIC_FIREBASE_*_EMULATOR_HOST`, `SEED_MY_UID`(시드 1번 유저를 본인 uid로 바꿀 때)
- `EXPO_PUBLIC_USE_FIREBASE_EMULATOR`는 env 파일에 두지 않는다. `npm run dev:emulator`·`dev:emulator:all`이 셸에서만 `true`로 주입한다(아래 함정 참조).
- `functions/.env` (Functions 배포용): `GOOGLE_WEB_CLIENT_ID`(Google 로그인 토큰 검증 audience, 앱의 `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`와 같은 값). Functions는 루트 `.env`를 읽지 않는다. git 미추적이라 워크트리·새 클론마다 직접 복사해야 하며, 없으면 `firebase deploy`가 값을 대화형으로 묻는다(`--non-interactive`에서는 실패)
- `GoogleService-Info.plist`, `google-services.json`도 git 미추적

## Expo SDK 54 빌드 제약 (2026-07, 52→54 업그레이드에서 확인)

- **SDK 업그레이드 후 dev client 재빌드 필수** — 구 네이티브 dev client로 새 번들을 열면 "App entry not found" 크래시. `expo run:ios`(로컬) 또는 `npm run build:ios:dev`(EAS)로 재빌드.
- **Metro package exports 비활성 유지** — SDK 53+ 기본 활성화지만 Firebase JS SDK v10과 비호환. `metro.config.js`의 `unstable_enablePackageExports = false`는 Firebase v12+ 업그레이드 전까지 유지.
- **tsconfig에서 `moduleResolution` 오버라이드 금지** — `expo/tsconfig.base`의 `customConditions`와 충돌(TS5098).
- **RNFB(@react-native-firebase)는 프리컴파일 React-Core와 non-modular header 충돌** — expo-build-properties ios의 `forceStaticLinking: ['RNFBApp', 'RNFBAnalytics']`로 해결 (expo/expo#39607).
- **프리컴파일 React-Core + `useFrameworks: static`은 런타임 크래시** — 빌드는 성공하나 앱 시작 시 "AccessibilityManager is nil" 네이티브 예외로 "App entry not found" 표시. `buildReactNativeFromSource: true`로 코어를 소스 빌드해 해결. 단 이 옵션은 fmt/folly 프리빌드까지 꺼서 fmt 11 컴파일이 실패하므로 pod install 시점에 `RCT_USE_RN_DEP=1` 필요 — 로컬은 `RCT_USE_RN_DEP=1 npx expo prebuild --clean -p ios`, EAS는 eas.json 각 프로필 `env`에 설정돼 있음.
- **`expo run:ios`는 시뮬레이터 검증에 부적합** — 실기기 연결 시 실기기를 기본 타깃으로 잡고, Xcode 26.6에서는 devicectl 출력 파싱 실패로 시뮬레이터까지 실기기로 오인해 서명 오류로 실패. 시뮬레이터 빌드는 xcodebuild 직접 사용(`-destination "platform=iOS Simulator,name=..."`).
- **`app.config.js`의 네이티브 설정(스플래시·아이콘 등)은 Xcode 빌드에 자동 반영되지 않음** — Xcode는 기존 `ios/`를 그대로 빌드하므로 변경 후 `RCT_USE_RN_DEP=1 npx expo prebuild --clean -p ios`로 다시 생성해야 한다. 워크트리마다 `ios/`가 따로라서, 빌드하는 워크트리에서 prebuild해야 하고 git에 없는 `GoogleService-Info.plist`·`.env.local`도 그 워크트리에 복사해야 한다. iOS는 실행 화면(스플래시)을 캐시하므로 새 빌드는 기존 앱을 삭제한 뒤 설치하고, 그래도 예전 화면이면 기기를 재시동한다.

## 시뮬레이터/dev 서버 함정

- **dev client가 리로드/재접속 후 스플래시에서 멈추면 네이티브 문제부터 의심** (2026-07, RN 0.81 New Architecture) — JS 로그가 정상이면 `isAppInitializing` 등 JS 초기화 버그로 오진하지 말 것. 확인된 원인 3가지: ① TurboModule 초기화 데드락(이 앱에 대한 `simctl launch/terminate`까지 무한 대기), ② Fabric 서페이스 마운트 실패(`xcrun simctl io booted screenshot`으로 화면 확인), ③ expo-splash-screen auto-hide 옵저버 소실(CDP에서 `globalThis.expo.modules.ExpoSplashScreen.hide()` 호출 시 화면이 나오면 확정). 복구는 공통 — 호스트에서 앱 프로세스 `kill -9` 후 재실행(`simctl terminate`는 같이 멈출 수 있어 소용없음).
- **dev client는 마지막으로 연결한 Metro에 다시 붙는다**: 워크트리마다 Metro를 다른 포트로 띄우면, 알림 탭이나 아이콘으로 앱을 새로 켤 때 다른 워크트리(예: 메인 저장소 8081)의 번들을 받아 수정 전 코드로 테스트하게 될 수 있다. 실기기는 `adb reverse tcp:<포트> tcp:<포트>` 후 `adb shell am start -a android.intent.action.VIEW -d "exp+animal-crossing-trading-app://expo-development-client/?url=http%3A%2F%2Flocalhost%3A<포트>"`로 한 번 열어 연결 대상을 바꾸고, Metro 로그에 `Bundled`나 앱 로그가 찍히는지로 확인한다. 이렇게 연 실행에서는 `Linking.getInitialURL()`이 이 dev client 주소를 반환한다.
- **Android 실기기에서 에뮬레이터 모드 로그인이 `functions/internal`로 실패하면 `adb reverse`부터 확인** — 앱은 실기기에서도 `localhost:5001` 등으로 에뮬레이터에 붙으므로 `adb reverse`가 필요하다. USB가 끊겼다 다시 붙으면(기기에 "USB로 충전 중" 토스트가 뜨면) reverse 목록이 비고, 요청이 에뮬레이터 로그에 찍히지도 않은 채 실패한다. `adb reverse --list`가 비어 있으면 `for p in 8081 5001 8080 9099 9199; do adb reverse tcp:$p tcp:$p; done`로 다시 연결한다.
- **포트 8081을 이전 세션의 `expo start`가 점유하면** 새 dev 서버가 8082로 밀리거나 앱이 엉뚱한 서버에 붙음. `lsof -iTCP:8081 -sTCP:LISTEN`으로 확인 후 정리.
- **dev:emulator인데 운영 Firebase에 붙는 경우** — SDK 55 기준으로 Metro를 시작할 때는 셸에서 준 `EXPO_PUBLIC_*` 값이 `.env*` 값보다 우선한다(`@expo/env`는 이미 정의된 키를 덮어쓰지 않는다). 하지만 **Metro 실행 중 `.env*`를 저장하면** Expo가 env 파일을 `force`로 다시 읽으면서, 처음 다시 읽을 때는 셸 주입 값까지 파일 값으로 덮어쓴다(`@expo/cli` `reloadEnvFiles`). env 파일에 `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false`가 있으면 그 순간부터 운영에 붙는다. 그래서 이 키는 env 파일에 두지 않는다. 파일에 없는 키는 다시 읽어도 덮어쓰지 않는다.
  - 운영에 붙었다면 ① env 파일에 이 키가 있는지, ② 앱이 이전에 `npm run dev`로 띄운 Metro에 다시 붙었는지 확인한다.
  - 확인 방법: `ps eww -p <Metro PID>`의 값은 시작 시점 값이라 믿을 수 없다. 앱과 같은 옵션으로 받은 번들(`curl "http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&unstable_transformProfile=hermes-stable"`)에서 `"EXPO_PUBLIC_USE_FIREBASE_EMULATOR": "..."` 값을 보거나, Metro 로그의 `Firebase Emulator 연결 완료`와 앱 화면의 에뮬레이터 데이터로 판단한다.

## 참고

- 포맷팅·린트·타입체크는 pre-commit 훅이 강제함 (`.husky/pre-commit`) — 수동으로 스타일을 맞추려 하지 말 것

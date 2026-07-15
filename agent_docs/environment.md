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

## 참고

- 포맷팅·린트·타입체크는 pre-commit 훅이 강제함 (`.husky/pre-commit`) — 수동으로 스타일을 맞추려 하지 말 것

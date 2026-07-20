# 개발 명령어

모든 스크립트 근거: `package.json`(앱), `functions/package.json`(functions).

## 앱 (루트)

```bash
npm run dev              # expo start --dev-client
npm run dev:emulator     # Firebase 에뮬레이터 연동 모드로 dev 서버 실행
npm run ios              # expo run:ios
npm run android          # expo run:android
npm run lint             # eslint .
npm run lint:fix         # eslint . --fix
npm run typecheck        # tsc --noEmit (앱)
npm run test             # jest — unit + maestro 프로젝트 실행 (agent_docs/testing.md 참조)
npx jest --selectProjects unit   # 앱 단위 테스트만 실행
npm run test:e2e         # jest --selectProjects maestro --runInBand
```

## 빌드 / 배포 (EAS + Firebase)

```bash
npm run build:ios              # eas build --profile production --platform ios
npm run build:ios:dev          # eas build --profile development --platform ios
npm run build:android          # eas build --profile production --platform android
npm run deploy:app             # eas submit -p ios --latest
npm run deploy:functions       # firebase deploy --only functions
npm run deploy:rules:firestore # firebase deploy --only firestore:rules
npm run deploy:rules:storage   # firebase deploy --only storage
```

> **iOS 제출**: Apple은 2026-04부터 iOS 26 SDK(Xcode 26) 빌드만 업로드 허용(오류 90725). EAS 빌드 이미지는 `eas.json`에 `image` 미지정 시 Expo SDK 버전 기본값을 따르므로, 제출 거부 시 Expo SDK·빌드 이미지 버전부터 확인.

## Firebase 에뮬레이터

```bash
npm run emulator:start            # firebase emulators:start
npm run emulator:start-with-data  # 데이터 import + 종료 시 export
npm run emulator:stop             # 프로세스 kill + 포트(4000,8080,9099,5001,9199 등) 정리
npm run emulator:seed             # node scripts/seed-test-data.js
```

## Functions (`functions/`, 별도 npm 프로젝트)

```bash
npm --prefix functions run build       # tsc
npm --prefix functions run lint        # eslint --ext .js,.ts .
npm --prefix functions run typecheck   # tsc --noEmit
npm --prefix functions test            # jest (에뮬레이터 필요, agent_docs/testing.md 참조)
npm --prefix functions run test:coverage
```

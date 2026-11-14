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
npm run dev:emulator:all          # Functions 빌드 → 에뮬레이터(데이터 유지) + 에뮬레이터 모드 Metro 한 번에 실행. 로그는 $TMPDIR/firebase-emulator.log
npm run emulator:start            # firebase emulators:start (Functions 빌드 안 함 → 먼저 npm --prefix functions run build)
npm run emulator:start-with-data  # 데이터 import + 종료 시 export (Functions 빌드 안 함)
npm run emulator:stop             # 프로세스 kill + 포트(4000,8080,9099,5001,9199 등) 정리
npm run emulator:seed             # 에뮬레이터 Auth·Firestore·Storage를 비우고 카탈로그·주민·테스트 데이터 시드 (에뮬레이터가 떠 있어야 함)
```

시드 데이터를 다음 실행에도 쓰려면: `npm run dev:emulator:all` 실행 → 다른 터미널에서 `npm run emulator:seed` → Metro를 Ctrl+C로 종료하면 `emulator-data/`로 export된다. 시드 상세는 [testing.md](testing.md) 참조.

## Functions (`functions/`, 별도 npm 프로젝트)

```bash
npm --prefix functions run build       # tsc
npm --prefix functions run lint        # eslint --ext .js,.ts .
npm --prefix functions run typecheck   # tsc --noEmit
npm --prefix functions test            # jest (에뮬레이터 필요, agent_docs/testing.md 참조)
npm --prefix functions run test:coverage
```

## GitHub Actions (Claude)

- `claude-code-review.yml`: master 대상 PR이 열리거나 ready로 바뀔 때 한 번, Claude Code 내장 `/code-review`(Opus, medium)가 `REVIEW.md` 기준을 적용해 한국어로 리뷰한다. 끝나면 요약과 실행 통계(소요 시간·비용·모델)를 PR 코멘트로 남긴다.
  - **`code-review` 플러그인을 쓰지 않는 이유**: Claude Code 2.1.279+에서 플러그인이 리뷰 에이전트를 띄우지 않고 17초 안팎에 "No issues found" 한 줄만 남긴다([anthropics/claude-code#100401](https://github.com/anthropics/claude-code/issues/100401)). 도구 허용이나 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS`로는 해결되지 않았다.
  - **리뷰가 실제로 수행됐는지는 통계 코멘트로 판단한다**: 정상 리뷰는 수 분, $0.5 이상이 든다. 수십 초·$0.1 수준이면 형식적으로 끝난 것이다. 내장 `/code-review`는 별도 컨텍스트에서 실행되어 `num_turns`가 항상 0이므로 턴 수는 기준으로 쓸 수 없다.
  - **워크플로 수정 PR에서는 리뷰가 실행되지 않는다**: claude-code-action은 PR의 워크플로 파일이 master와 다르면 리뷰를 건너뛰는데, job은 `success`로 표시된다. 변경은 머지한 뒤 다른 PR에서 검증한다.
- `claude.yml`: PR 댓글·리뷰에 `@claude`를 쓰면 작업 후 PR 브랜치에 푸시한다. 댓글 이벤트 워크플로는 기본 브랜치(master)의 파일로 실행되므로, 워크플로 수정은 머지 후에야 반영된다.
- 두 워크플로 모두 `CLAUDE_CODE_OAUTH_TOKEN` 시크릿(`claude setup-token`으로 발급)이 필요하다.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## 프로젝트 개요

"모동숲 마켓"(Animal Crossing Trading Market)은 한국 모여봐요 동물의 숲 플레이어를 위한 아이템 거래 마켓플레이스 모바일 앱이다.

Expo(SDK 52) 기반 React Native 앱이며, Firebase를 백엔드로 실시간 채팅·소셜 로그인·푸시 알림·Algolia 검색을 제공한다.

현재 버전 1.8.1(`app.config.js`), iOS App Store 출시 중이며 Android 지원 예정.

저장소는 앱(`src/`)과 Firebase Cloud Functions(`functions/`) 두 개의 npm 프로젝트로 구성된 폴리레포 구조다.

## 개발 명령어

모든 스크립트 근거는 `package.json`(앱)과 `functions/package.json`(functions).

### 앱 (루트)
```bash
npm run dev              # expo start --dev-client
npm run dev:emulator     # Firebase 에뮬레이터 연동 모드로 dev 서버 실행
npm run ios              # expo run:ios
npm run android          # expo run:android
npm run lint             # eslint .
npm run lint:fix         # eslint . --fix
npm run typecheck        # tsc --noEmit (앱)
npm run test             # jest — 현재 maestro 프로젝트만 실행됨 (아래 '테스트 전략' 참고)
npm run test:e2e         # jest --selectProjects maestro --runInBand
```

### 빌드 / 배포 (EAS + Firebase)
```bash
npm run build:ios              # eas build --profile production --platform ios
npm run build:ios:dev          # eas build --profile development --platform ios
npm run build:android          # eas build --profile production --platform android
npm run deploy:app             # eas submit -p ios --latest
npm run deploy:functions       # firebase deploy --only functions
npm run deploy:rules:firestore # firebase deploy --only firestore:rules
npm run deploy:rules:storage   # firebase deploy --only storage
```

### Firebase 에뮬레이터
```bash
npm run emulator:start            # firebase emulators:start
npm run emulator:start-with-data  # 데이터 import + 종료 시 export
npm run emulator:stop             # 프로세스 kill + 포트(4000,8080,9099,5001,9199 등) 정리
npm run emulator:seed             # node scripts/seed-test-data.js
```

### Functions (`functions/`, 별도 프로젝트)
```bash
npm --prefix functions run build       # tsc
npm --prefix functions run lint        # eslint --ext .js,.ts .
npm --prefix functions run typecheck   # tsc --noEmit
npm --prefix functions test            # jest (에뮬레이터 필요, 아래 참고)
npm --prefix functions run test:coverage
```

## 아키텍처

### 핵심 기술 스택 (버전은 `package.json` 기준)
- **React Native 0.76.9 + Expo SDK 52** — New Architecture 활성화(`app.config.js`의 `newArchEnabled: true`)
- **Firebase 10.14.1 (JS SDK)** — Auth, Firestore, Functions, Storage
- **@react-native-firebase/app·analytics 23.x** — 네이티브 Analytics
- **Zustand 5** — 전역 상태
- **@tanstack/react-query 5** — 서버 상태/캐싱
- **React Navigation 7** — 네이티브 스택 + 바텀 탭 + top tabs
- **React Hook Form 7 + Zod 3** — 폼/검증
- **algoliasearch 5** — 전체 텍스트 검색
- **소셜 로그인** — @react-native-kakao, @react-native-seoul/naver-login, expo-apple-authentication
- **react-native-google-mobile-ads** — AdMob

### 디렉토리 구조
```
src/
├── components/     # 기능별 UI 컴포넌트 (Home/, Chat/, PostDetail/, NewPost/, ui/ 등)
├── screens/        # 화면 컴포넌트 (Home, PostDetail, NewPost, ChatRoom, Login 등)
├── navigation/     # 네비게이터 + RootNavigation.ts(navigationRef)
├── hooks/          # 도메인별 훅 (post/, chat/, item/, villager/, shared/ 등)
├── stores/         # Zustand 스토어 (auth/, chat/, block/, notification/, push/, ads/, onboarding/)
├── firebase/
│   ├── core/       # firestoreService, firebaseInterceptor, errorMessages, types
│   └── services/   # 도메인별 서비스 (postService, userService, chatService 등 15개)
├── types/          # 도메인 타입 정의 (post.ts, user.ts, components.ts 등)
├── theme/          # Color, Spacing, Typography, BorderRadius, Shadow
├── constants/      # 앱 상수
├── config/         # firebase.ts(초기화), reactotron.ts
└── utilities/      # 헬퍼 (analytics 등)

functions/src/      # Cloud Functions: auth/, notifications/, triggers/, schedulers/, utils/
__tests__/maestro/  # Maestro E2E 오케스트레이션 (Jest로 순서 제어)
.maestro/           # Maestro flow YAML (auth/, posts/, trade/, profile/)
```

### 상태 관리 매핑
| 종류 | 도구 → 위치 |
|------|-------------|
| 서버 상태 | React Query → `src/hooks/{domain}/query`, `mutation` |
| 전역 상태 | Zustand → `src/stores/{domain}/` |
| 폼 상태 | React Hook Form + Zod → `src/hooks/{domain}/form/` |
| URL/딥링크 | React Navigation `linking` → `App.tsx` |

### 진입점 Provider 중첩 (`App.tsx`)
```
QueryClientProvider
└─ AppContent
   └─ ErrorBoundary
      └─ ActionSheetProvider
         └─ GestureHandlerRootView
            └─ SafeAreaProvider
               └─ NavigationContainer (linking, onStateChange→logScreenView)
                  └─ SafeAreaView
                     └─ RootStackNavigator
```

**초기화 훅 실행 순서 (중요, `App.tsx`)**

- `App`에서 다음 순서로 실행: `useAuthInitializer` → `useAdMobInitializer` → `usePushNotificationInitializer` → `useBlockSubscriptionInitializer` → `useOnboardingInitializer` → `useSuspensionGuard` → `useOnlineManager`/`useAppState`/`useAppLifecycle`.
- `useNotificationSubscriptionInitializer`·`useChatSubscriptionInitializer`는 `QueryClientProvider` 하위인 `AppContent`에서 실행됨 (React Query 컨텍스트 의존).
- 새 구독/초기화 훅 추가 시 인증 이후 순서와 Provider 위치를 지켜야 함.

### 이 프로젝트만의 필수 패턴 / 함정

**Firestore 요청은 `firestoreRequest` 인터셉터로 래핑** (`src/firebase/core/firebaseInterceptor.ts`).

첫 인자는 로그용 이름이고, `options.throwOnError`에 따라 반환 타입이 갈린다(오버로드). DEV에서 Reactotron으로 결과 로깅.

```typescript
// 시그니처 (첫 인자 = 로그용 이름)
firestoreRequest(name, operation, { throwOnError: true }): Promise<T>   // 실패 시 throw
firestoreRequest(name, operation): Promise<T | null>                   // 실패 시 Alert 후 null

// null 방식 (userService.ts: getUserInfo) — 호출부에서 ?? 폴백과 함께 사용
return firestoreRequest('나의 정보 조회', async () => {
  const docData = await getDocFromFirestore({ collection: 'Users', id: uid });
  return docData ? ({ uid: docData.id, ...docData } as UserInfo) : null;
});

// throw 방식 (commentService.ts: deleteComment) — mutation에서 에러를 상위로 전파
return firestoreRequest(
  '댓글 삭제',
  async () => {
    /* batch.delete(...) */
    await batch.commit();
    return { replyCount };
  },
  { throwOnError: true },
);
```

**Firestore `in` 쿼리 10개 제한 우회는 서비스 레이어에서** (훅이 아님).

`chunkArray(ids, 10)`로 나눠 `Promise.all`로 병렬 조회 후 `flat`으로 병합. 예: `userService.ts:78`(`getPublicUserInfos`), `postService.ts:91`.

```typescript
// src/firebase/services/userService.ts: getPublicUserInfos
const chunks = chunkArray(creatorIds, 10);          // 10개씩 분할
const chunkResults = await Promise.all(             // 청크별 병렬 조회
  chunks.map((chunk) =>
    queryDocs(query(usersRef, where('__name__', 'in', chunk))),
  ),
);
// chunkResults.flat() 후 { [uid]: PublicUserInfo } 형태로 병합해 반환
```

기타 함정:

- **Firebase 초기화는 `src/config/firebase.ts`에서만.**
  - 에뮬레이터 연결은 `EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && __DEV__`일 때만.
  - `getReactNativePersistence`는 타입 미제공이라 `@ts-expect-error` 필요.
- **SplashScreen.hideAsync()는 `App.tsx`에서만 호출** (훅 내부에서 호출 금지).
- **`.npmrc`에 `legacy-peer-deps=true`** — 의존성 설치 시 peer 충돌을 무시. CI도 `npm ci`로 이를 전제함.
- **`patch-package` 사용** — `postinstall`에서 `patches/`의 패치 적용. 라이브러리 직접 수정 대신 패치로 관리.
- **`overrides`로 `query-string` 6.14.1 고정** (`package.json`).

## 코드 스타일

- **Prettier** (`.prettierrc`): 탭 들여쓰기(`useTabs: true`), `tabWidth: 4`, `singleQuote: true`, `trailingComma: "all"`, `semi: true`, `printWidth: 100`.
- **ESLint** (`.eslintrc.js`): `expo` + `@typescript-eslint/recommended` + `react-hooks/recommended` + `import/recommended` + `prettier` 확장.
  - `unused-imports/no-unused-imports: error` — 미사용 import는 에러(자동 제거 대상).
  - 미사용 변수는 warn, `_` 접두사는 예외.
  - `import/order: error` — builtin→external→internal→상대→type 순, 그룹 간 빈 줄, 알파벳 정렬.
  - `react/react-in-jsx-scope: off`, `react/prop-types: off`.
  - 테스트 파일(`__tests__`, `*.test.*`)은 `no-explicit-any`, unused-vars 완화.
  - `functions/`는 lint 대상에서 제외(`ignorePatterns`) — functions는 자체 ESLint 사용.
- **TypeScript** (`tsconfig.json`): `strict: true`, 경로 alias `@/* → ./src/*`, `@assets/* → ./assets/*`. `functions`는 exclude(별도 tsconfig).
- 커밋 시 `pre-commit` 훅이 `lint-staged`(변경 파일 `eslint --fix`) + `npm run typecheck` 실행(`.husky/pre-commit`).

## 테스트 전략

- **앱 단위 테스트는 현재 없음**
  - `jest.config.js`에 `maestro` 프로젝트만 정의되어 있어 `npm test`는 Maestro E2E 오케스트레이션만 실행한다.
  - `src/__tests__/`에는 테스트가 아니라 Firebase 시드/정리 유틸만 있음.
- **E2E: Maestro**
  - flow는 `.maestro/*.yaml`, Jest 러너는 `__tests__/maestro/*.test.js`가 순서(`maestro-sequencer.js`: auth-flow → post-flow → trade-flow)를 제어.
  - 새 기능 추가 시 컴포넌트에 `testID` prop 부여.
- **Functions 테스트가 실제 자동화 테스트의 중심**
  - `functions/__tests__/`에 auth 단위 테스트(`*.test.ts`)와 트리거 통합 테스트(`*.integration.test.ts`)가 있음.
  - 에뮬레이터 위에서 실행(`firebase emulators:exec ... "npm test"`), Java 필요(CI는 Java 21).

## 중요 패턴

### 도메인 중심 훅 구조
훅은 도메인별 → 타입별로 배치: `src/hooks/{domain}/{query|mutation|form}/`.

예: `src/hooks/post/query/useInfinitePosts.ts`, `src/hooks/post/form/newPostFormSchema.ts`.

### Zustand 스토어 모듈 구조
각 스토어는 `store.ts`, `types.ts`, `index.ts`, `initializer.ts`를 갖고, 필요 시 `providers/`, `utils/`를 둔다(예: `src/stores/auth/`).

초기화는 `App.tsx`에서 `use{Domain}Initializer` 훅으로 호출.

### React Query 기본 설정 (`App.tsx`)
`staleTime: 5분`, `gcTime: 10분`, `retry: 1`.

무한 스크롤은 `useInfiniteQuery`(예: `useInfinitePosts.ts`), 검색은 Algolia 쿼리 훅(`useSearchPosts.ts`, `useSearchItems.ts`).

### 게시글 상태 필터
게시글 조회 시 `where('status', 'not-in', ['hidden', 'deleted'])`로 숨김/삭제 게시글 제외(`useInfinitePosts.ts`).

## 환경 설정

- **Node 22** (CI `setup-node`, `functions` engines). 패키지 매니저는 npm.
- **최초 설정**: `npm install`(루트) → `cd functions && npm install`.
  - `postinstall`이 patch-package 실행, `prepare`가 husky 설치.
- **환경 변수** (`.env`, git 미추적):
  - Firebase: `EXPO_PUBLIC_API_KEY`, `EXPO_PUBLIC_AUTH_DOMAIN`, `EXPO_PUBLIC_PROJECT_ID`, `EXPO_PUBLIC_STORAGE_BUCKET`, `EXPO_PUBLIC_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_APP_ID`, `EXPO_PUBLIC_MEASUREMENT_ID`
  - Algolia: `EXPO_PUBLIC_ALGOLIA_APP_ID`, `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY`
  - 소셜: `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`, `EXPO_PUBLIC_NAVER_CLIENT_ID`, `EXPO_PUBLIC_NAVER_SECRET` 등
  - AdMob/EAS: `EXPO_PUBLIC_ADMOB_IOS_APP_ID`, `EXPO_PUBLIC_EAS_PROJECT_ID`, `GOOGLE_SERVICE_INFO_PLIST`
- **에뮬레이터용 변수는 `.env.local`** (git 미추적): `EXPO_PUBLIC_USE_FIREBASE_EMULATOR`, `EXPO_PUBLIC_FIREBASE_*_EMULATOR_HOST`.
- `GoogleService-Info.plist`, `google-services.json`은 git 미추적(`.gitignore`).

## Git 워크플로우

- **커밋 컨벤션**: Conventional Commits, 한국어 메시지.
  - 허용 타입: `feat, design, fix, chore, docs, perf, ci, style, refactor` (`commitlint.config.js` — `design`이 커스텀 타입).
  - `commit-msg` 훅에서 commitlint 검증.
- **브랜치 전략**: 접두사 기반 작업 브랜치(`feat/`, `fix/`, `ci/`, `design/` 등).
  - PR 대상 브랜치는 **master** (`.github/workflows/ci.yml`의 `pull_request.branches: [master]`).
- **CI** (`ci.yml`, PR→master 트리거):
  - 앱 Lint + TypeCheck는 항상 실행.
  - functions Lint/TypeCheck/Build는 `functions/**` 변경 시에만.
  - functions 테스트는 항상(Java 21 + 에뮬레이터).
  - Claude 자동 코드 리뷰 job 포함.
- 커밋은 사용자가 직접 수행(자동 커밋 금지). PR/커밋 메시지에 AI 출처 표기 금지.

## 추가 사항

- **응답 언어**: 한국어. 사용자 대면 텍스트·커밋 메시지도 한국어.
- **톤**: 간결하고 직접적인 격식체, 핵심 위주.
- **도메인 주의사항**:
  - 한국어 욕설 필터(`cenkor`), KST 시간 처리, 동물의 숲 아이템/주민 데이터 정확성.
  - 실시간 채팅 안정성과 기존 사용자 데이터 호환성 유지.
- **작업 원칙**:
  - 리스너/구독은 언마운트 시 정리(메모리 누수 방지).
  - 새 기능은 Firestore 규칙(`firestore.rules`) 업데이트 동반.
  - 3개 이상 파일 또는 구조 변경은 계획을 먼저 공유 후 진행.

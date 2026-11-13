# REVIEW.md

PR 리뷰 시 정확성 버그와 함께 아래 기준을 확인한다. 코드 작성 규칙 전체는 [CLAUDE.md](CLAUDE.md)와 `agent_docs/`를 따른다.

## 반드시 지적할 것

### Firestore

- Firestore 요청이 `firestoreRequest`로 래핑되지 않았다 (`src/firebase/core/firebaseInterceptor.ts`).
- mutation에서 에러를 상위로 전파해야 하는데 `{ throwOnError: true }` 없이 호출해, 실패가 `null`로 조용히 넘어간다.
- `in` / `not-in` / `array-contains-any` 쿼리에 10개를 넘을 수 있는 배열을 그대로 넘긴다. 분할은 서비스 레이어에서 `chunkArray`로 한다.
- 새 컬렉션·필드를 읽거나 쓰는데 `firestore.rules` 변경이 없다.
- 게시글 조회에서 `hidden`·`deleted` 상태 필터가 빠졌다.

### 구독과 정리

- `onSnapshot`, `onAuthStateChanged`, `addEventListener`, `AppState`·`Keyboard` 리스너, 타이머를 `useEffect`에서 등록하고 cleanup에서 해제하지 않는다.

### 초기화 순서 (`App.tsx`)

- 새 초기화·구독 훅이 `useAuthInitializer`보다 먼저 실행된다.
- React Query에 의존하는 구독 훅이 `QueryClientProvider` 바깥에서 실행된다.
- 개별 훅에서 JS 스플래시를 제어한다. 스플래시 표시·해제는 `RootStackNavigator`의 `isAppInitializing`만 담당한다.

### Cloud Functions (`functions/`)

- 앱 코드(`src/`)를 import한다. `functions/`는 별도 npm 프로젝트다.
- 트리거·스케줄러의 시간 계산이 실행 환경 타임존에 의존한다. 한국 시간 기준이 필요하면 명시적으로 변환한다.

## 배포 영향 알림

아래 변경이 있으면 버그가 아니어도 요약 코멘트에 배포 시 필요한 작업을 적는다.

- `package.json`의 네이티브 의존성, `app.config.js`, `eas.json` 변경: 새 네이티브 빌드(`eas build`)가 필요하다.
- `firestore.rules`, `firestore.indexes.json`, `storage.rules` 변경: Firebase 규칙·인덱스 배포가 필요하다.
- `functions/` 변경: Cloud Functions 배포가 필요하다.
- 새 `EXPO_PUBLIC_*` 환경 변수: EAS 환경 변수 등록이 필요하다.

## 지적하지 않을 것

- ESLint·Prettier가 잡는 포맷과 스타일
- `docs/` 아래 작업 계획 문서의 문장 표현

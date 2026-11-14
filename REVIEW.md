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

## 검증 단계

지적 후보를 요약과 인라인 코멘트에 올리기 전에, 후보마다 코드를 다시 읽어 실제 문제인지 확인한다.

- 해당 파일과 그 값을 쓰거나 호출하는 코드를 직접 읽고, Failure scenario의 입력이 실제로 그 코드 경로에 도달하는지 확인한다.
- 확인한 결과에 따라 판정을 하나 붙인다.
  - **확인됨**: 코드만으로 실패 경로를 끝까지 따라갈 수 있다.
  - **가능성 있음**: 경로는 있지만 결과가 기기·런타임 동작(레이아웃 계산, 플랫폼·기기 차이, 네트워크 등)에 달려 있어 코드만으로는 확정할 수 없다.
  - **오탐**: 다시 읽어 보니 전제가 틀렸거나 다른 곳에서 이미 처리된다.
- 오탐은 인라인 코멘트를 달지 않는다. 요약 맨 아래 "제외한 후보"에 한 줄로 이유만 적는다.
- 판정과 별개로 중요도를 붙인다.
  - **높음**: 기능을 쓸 수 없거나, 데이터가 잘못 저장·삭제되거나, 보안·권한 문제가 생긴다.
  - **중간**: 특정 기기·조건에서 화면이 깨지거나 동작이 틀린다.
  - **낮음**: 지금은 동작하지만 이후 변경에서 깨지기 쉽다(하드코딩, 중복 등).

## 요약 코멘트 형식

요약은 한국어로 쓰고, 아래 형식을 따른다. 인라인 코멘트도 첫 줄에 `**판정 · 중요도**`를 붙인다.

- 첫 문단: 몇 건을 남겼는지와 판정별 건수를 적는다(예: "확인됨 3건, 가능성 있음 2건, 오탐으로 제외 2건").
- 항목 순서: 확인됨을 가능성 있음보다 먼저, 같은 판정 안에서는 중요도가 높은 순으로 둔다.
- 항목 형식: 첫 줄에 위치와 판정·중요도를 쓰고, 내용은 3칸 들여쓴 하위 불릿으로 나눈다. 코드·식별자는 백틱으로 감싼다.

```markdown
1. `src/screens/ChatRoom.tsx:264` · **확인됨 · 중간**
   - Android의 `bottomOffset`이 아직 `insets.bottom` 기준입니다.
   - Failure scenario: 3버튼 모드(inset 48)에서는 `50 - 48 - 8 = -6`이 되어 입력창이 툴바에 가려집니다.
   - 근거: `ChatRoom.tsx:264`의 식과 `GiftedChat`의 `bottomOffset` 처리(`translateY`)를 따라가 확인했습니다.
```

- "근거" 불릿: 확인됨이면 검증 때 따라간 코드 위치를, 가능성 있음이면 무엇을 기기에서 확인해야 확정되는지를 적는다.
- 오탐으로 제외한 후보는 맨 아래 "제외한 후보"에 `위치`: 제외 이유 한 줄씩 적는다.

## 지적하지 않을 것

- ESLint·Prettier가 잡는 포맷과 스타일
- `docs/` 아래 작업 계획 문서의 문장 표현

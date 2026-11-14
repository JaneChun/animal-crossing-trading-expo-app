# 테스트 전략

## 현황

- `jest.config.js`에 `unit`(`src/__tests__/**/*.test.ts(x)`)과 `maestro` 두 프로젝트 정의 → `npm test`는 둘 다 실행.
- 앱 단위 테스트: `src/__tests__/` 하위 — `utilities/`(유틸리티), `components/`(컴포넌트) 등. 단위 테스트만 실행: `npx jest --selectProjects unit`
- `src/__tests__/firebase-utils/`는 테스트가 아니라 Maestro E2E용 Firebase 헬퍼(`test-helpers.js`, `cleanup-test-data.js`)와 Admin SDK 초기화(`firebase-admin-setup.js`). 에뮬레이터 시드는 `scripts/emulator/`에 있다.

## 에뮬레이터 시드 (`npm run emulator:seed`)

- 진입점 `scripts/emulator/seed-test-data.js`. Admin 초기화는 `src/__tests__/firebase-utils/firebase-admin-setup.js`를 함께 쓴다. 실행하면 에뮬레이터의 Auth·Firestore·Storage를 **모두 비운 뒤** 이미지 → 카탈로그 → 주민 → 테스트 데이터(유저·게시글·채팅·댓글·리뷰·알림·신고) 순서로 넣는다. `.env`, `.env.local`을 읽는다.
- 관리자 화면 확인용 데이터도 함께 넣는다. 1번 유저(`SEED_MY_UID`)는 `role: 'admin'`이고, 신고 10건(게시글·댓글·답글·채팅·프로필, 관리자 숨김 글·작성자 삭제 글, 처리 완료 4건)과 정지·검토 필요 유저(`user3`), 본인 계정으로 한 번 더 신고하면 7일 정지가 걸리는 정지 직전 유저(`user4`), 신고된 채팅의 `reportedAt`, 신고 스냅샷이 들어간다. 스냅샷은 시드 중 트리거가 꺼져 있어 `onReportWritten` 대신 시드가 직접 쓴다.
- 카탈로그(`seed-catalog.js`)의 원본 `functions/scripts/output/catalog.json`은 gitignore 대상이다. 없으면 경고 후 카탈로그만 건너뛴다.
- 주민(`seed-villagers.js`)은 실행할 때마다 운영 Algolia `Villagers` 인덱스에서 가져온다. 문서 ID가 Algolia `objectID`(= 운영 문서 ID)와 같아야 앱에서 검색한 주민이 표시된다. 네트워크나 키가 없으면 경고 후 건너뛴다.
- 이미지(`seed-images.js`): `scripts/emulator/seed-images/users/`(프로필)와 `communities/`(커뮤니티 글)에 `jpg`·`jpeg`·`png`·`webp`를 넣으면 이름순으로 배정해 Storage에 올린다. 이 폴더는 gitignore 대상이라 직접 만들어 넣는다. 비어 있으면 이미지 없이 시드한다.
- 본인 계정으로 시드 데이터 보기: 에뮬레이터 모드에서 한 번 로그인해 Emulator UI(http://localhost:4000) Auth 탭에서 uid를 확인하고, `.env.local`에 `SEED_MY_UID=<uid>`를 넣고 시드하면 1번 시드 유저 자리에 들어간다. 시드 유저 uid로는 앱에서 로그인할 수 없다(소셜 로그인 → 커스텀 토큰 흐름이라).
- 이미지 URL에는 `EXPO_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST` 호스트가 그대로 저장된다. 실기기 테스트로 Mac IP를 쓰다가 IP가 바뀌면 이미지가 깨지므로, 호스트를 고친 뒤 시드를 다시 실행한다.
- Admin SDK로 에뮬레이터에 직접 쓸 때도 Functions 에뮬레이터가 떠 있으면 Firestore 트리거가 실행된다. 댓글·대댓글 생성은 `commentCount`를, 리뷰 생성은 유저 `review` 집계를 올리므로, 이 값을 직접 계산해 넣는 시드는 두 배가 된다. 시드 중에는 Emulator Hub `PUT http://127.0.0.1:4400/functions/disableBackgroundTriggers`로 트리거를 끄고 끝나면 `enableBackgroundTriggers`로 켠다.

## 단위 테스트 작성 규칙

- 테스트 하나는 실패 원인이 하나가 되도록 동작 하나만 검증한다. 기존 상태와의 중복, 입력 내부 중복처럼 조건이 다르면 테스트를 분리한다.
- 정제 → 중복 제거처럼 변환 단계가 둘 이상이면 의미 있는 중간 변수로 나눠 Arrange/Act/Assert의 데이터 흐름을 드러낸다.
- unit 프로젝트의 변환기(`jest.ts-transformer.js`)는 `jest.mock`을 파일 맨 위로 끌어올리지 않는다. `react-native` 등을 mock하는 테스트는 mock 선언 뒤에 `require`로 대상 모듈을 불러와야 한다. `import`로 불러오면 실제 `react-native`가 로드되어 파싱 에러가 난다.
- 테마를 쓰는 컴포넌트(`useTheme`·`useThemedStyles`)를 테스트할 때는 `@/theme/Color`를 mock하지 말고 `@/theme/ThemeProvider`의 `useTheme`을 mock한다. `Color`를 일부 키만 가진 객체로 mock하면 `lightColors`가 `undefined`가 되어 렌더링이 실패한다. 예: `useTheme: () => ({ scheme: 'light', colors: jest.requireActual('@/theme/Color').lightColors })`

## E2E: Maestro

- flow 정의: `.maestro/*.yaml` (auth/, posts/, trade/, profile/)
- 순서 제어: Jest 러너 `__tests__/maestro/*.test.js`
  - `maestro-sequencer.js`: auth-flow → post-flow → trade-flow
- 새 기능 추가 시 컴포넌트에 `testID` prop 부여.
- 앱이 Firebase 에뮬레이터에 붙었는지는 번들을 curl로 받아 `EXPO_PUBLIC_USE_FIREBASE_EMULATOR` 값을 보는 것만으로 판단하지 않는다. Metro는 실행 중에 `.env`가 바뀌면 값을 다시 읽고, 앱이 요청하는 번들은 curl 요청과 변환 옵션이 달라 따로 변환되므로, curl 번들은 `true`인데 앱은 운영에 붙어 있을 수 있다. 쓰기·읽음 처리가 일어나는 화면에 들어가기 전에 앱 화면에 에뮬레이터 데이터가 보이는지 확인한다.
- iOS 시뮬레이터와 Android 에뮬레이터가 함께 켜져 있으면 Maestro는 기기를 지정하지 않을 때 Android를 고른다. 의도한 기기에서만 실행되도록 `maestro --device <UDID> test ...`로 명시한다(iOS UDID: `xcrun simctl list devices booted`, Android: `adb devices`).

## Functions 테스트

- 위치: `functions/__tests__/` — 도메인별 하위 폴더 (auth/, notifications/, utils/, triggers/)
- 단위 테스트(`*.test.ts`): mock 기반, 에뮬레이터 불필요
- 통합 테스트(`triggers/*.integration.test.ts`): 실제 Firestore 에뮬레이터에 읽기/쓰기 — 에뮬레이터 없이 실행하면 실패
- 공용 헬퍼(에뮬레이터 연결, 픽스처, mock, 전역 setup): `functions/__tests__/helpers/`
- Jest 설정: `functions/jest.config.js` — 통합 테스트가 에뮬레이터를 공유하므로 `maxWorkers: 1` 순차 실행
- **타임존 함정**: Cloud Functions와 CI 러너는 UTC, 로컬은 KST. `new Date(now.toLocaleString(..., { timeZone: 'Asia/Seoul' }))` + `setHours(0,0,0,0)`은 실행 환경 타임존으로 재해석되어 UTC에서는 KST 09:00이 됨 → 로컬에선 통과하고 CI는 KST 00~09시에만 실패. KST 날짜 계산은 고정 오프셋(+9h, DST 없음)으로 하고(`functions/src/triggers/reports.ts`의 `getKstMidnightAfterDays`), 시각 검증 테스트는 `TZ=UTC`로도 돌려 볼 것.

### 실행

```bash
cd functions && npx firebase emulators:exec "npm test"   # 에뮬레이터 포함 전체 실행 (CI와 동일, 권장)
npm --prefix functions test                              # 에뮬레이터가 이미 떠 있을 때
npm --prefix functions run test:coverage                 # 커버리지
```

- 에뮬레이터 구동에 Java 필요 (CI는 Java 21).

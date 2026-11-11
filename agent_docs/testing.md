# 테스트 전략

## 현황

- `jest.config.js`에 `unit`(`src/__tests__/**/*.test.ts(x)`)과 `maestro` 두 프로젝트 정의 → `npm test`는 둘 다 실행.
- 앱 단위 테스트: `src/__tests__/` 하위 — `utilities/`(유틸리티), `components/`(컴포넌트) 등. 단위 테스트만 실행: `npx jest --selectProjects unit`
- `src/__tests__/firebase-utils/`는 테스트가 아니라 Firebase 시드/정리 유틸.

## 단위 테스트 작성 규칙

- 테스트 하나는 실패 원인이 하나가 되도록 동작 하나만 검증한다. 기존 상태와의 중복, 입력 내부 중복처럼 조건이 다르면 테스트를 분리한다.
- 정제 → 중복 제거처럼 변환 단계가 둘 이상이면 의미 있는 중간 변수로 나눠 Arrange/Act/Assert의 데이터 흐름을 드러낸다.
- unit 프로젝트의 변환기(`jest.ts-transformer.js`)는 `jest.mock`을 파일 맨 위로 끌어올리지 않는다. `react-native` 등을 mock하는 테스트는 mock 선언 뒤에 `require`로 대상 모듈을 불러와야 한다. `import`로 불러오면 실제 `react-native`가 로드되어 파싱 에러가 난다.

## E2E: Maestro

- flow 정의: `.maestro/*.yaml` (auth/, posts/, trade/, profile/)
- 순서 제어: Jest 러너 `__tests__/maestro/*.test.js`
  - `maestro-sequencer.js`: auth-flow → post-flow → trade-flow
- 새 기능 추가 시 컴포넌트에 `testID` prop 부여.

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

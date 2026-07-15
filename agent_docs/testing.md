# 테스트 전략

## 현황

- `jest.config.js`에 `unit`(`src/__tests__/**/*.test.ts(x)`)과 `maestro` 두 프로젝트 정의 → `npm test`는 둘 다 실행.
- 앱 단위 테스트: `src/__tests__/utilities/` — 유틸리티 대상. 단위 테스트만 실행: `npx jest --selectProjects unit`
- `src/__tests__/firebase-utils/`는 테스트가 아니라 Firebase 시드/정리 유틸.

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

### 실행

```bash
cd functions && npx firebase emulators:exec "npm test"   # 에뮬레이터 포함 전체 실행 (CI와 동일, 권장)
npm --prefix functions test                              # 에뮬레이터가 이미 떠 있을 때
npm --prefix functions run test:coverage                 # 커버리지
```

- 에뮬레이터 구동에 Java 필요 (CI는 Java 21).

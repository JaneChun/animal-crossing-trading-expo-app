# CLAUDE.md

## 프로젝트 (WHAT / WHY)

"모동숲 마켓" — 한국 '모여봐요 동물의 숲' 플레이어를 위한 아이템 거래 마켓플레이스 모바일 앱.

- **스택**
  - React Native 0.76 + Expo SDK 52 (New Architecture)
  - Firebase JS SDK — Auth, Firestore, Functions, Storage
  - Zustand 5 (전역 상태), React Query 5 (서버 상태)
  - React Navigation 7, React Hook Form + Zod, Algolia 검색
- **구조**: 폴리레포 — 앱(`src/`)과 Firebase Cloud Functions(`functions/`, 별도 npm 프로젝트)
- **상태**: iOS App Store 출시 중(버전은 `app.config.js` 참조), Android 지원 예정

```
src/
├── components/   # 기능별 UI (Home/, Chat/, NewPost/, ui/ 등)
├── screens/      # 화면 컴포넌트
├── hooks/        # 도메인별: {domain}/{query|mutation|form}/
├── stores/       # Zustand 스토어 (store.ts, types.ts, initializer.ts 구조)
├── firebase/     # core/(인터셉터, 공통) + services/(도메인별 15개)
├── navigation/ types/ theme/ constants/ config/ utilities/
functions/src/    # Cloud Functions (auth/, triggers/, schedulers/ 등)
```

## 핵심 명령어 (HOW)

```bash
npm run dev          # 개발 서버 (expo start --dev-client)
npm run lint         # eslint .
npm run typecheck    # tsc --noEmit (앱)
npm run test         # jest — unit(src/__tests__) + Maestro E2E 프로젝트 실행
```

빌드/배포/에뮬레이터/functions 명령어는 [agent_docs/commands.md](agent_docs/commands.md) 참조.

## 반드시 지킬 규칙

1. **응답·커밋 메시지·사용자 대면 텍스트는 한국어** — 간결하고 직접적인 격식체.
2. **커밋은 사용자가 직접 수행** — 자동 커밋 금지. PR/커밋에 AI 출처 표기 금지.
3. **Firestore 요청은 `firestoreRequest` 인터셉터로 래핑**
   - 오버로드 정의: `src/firebase/core/firebaseInterceptor.ts:7`
   - 상세 패턴: agent_docs/firebase-patterns.md
4. **3개 이상 파일 또는 구조 변경은 계획을 먼저 공유** 후 진행.
5. **새 기능 추가 시 Firestore 규칙(`firestore.rules`) 업데이트 동반.**
6. **리스너/구독은 언마운트 시 정리** (메모리 누수 방지).
7. **문서-코드 불일치 발견 시 수정 제안** — 작업 중 CLAUDE.md나 agent_docs 내용이 실제 코드와 다른 것을 발견하면, 어떻게 수정할지 사용자에게 먼저 확인받은 뒤 문서를 코드에 맞게 고친다.
8. **버그 원인·함정·겉으로 드러나지 않는 제약을 발견하면 즉시 agent_docs에 기록** — 세션 끝을 기다리지 않는다. 재발 방지 가치가 있는 것만, 해당 도메인 문서에 간결하게 추가한다. 세션 단위 일괄 정리는 `/retrospect` 스킬 사용.

## 세부 문서 (필요할 때 읽기)

작업이 아래 영역에 해당하면 **해당 문서를 먼저 읽고 진행**:

| 문서 | 내용 | 읽어야 할 때 |
|------|------|-------------|
| [agent_docs/commands.md](agent_docs/commands.md) | 빌드·배포·에뮬레이터·functions 전체 명령어 | 빌드/배포/에뮬레이터 작업 |
| [agent_docs/architecture.md](agent_docs/architecture.md) | 상태 관리 매핑, App.tsx 초기화 제약, 주요 패턴 | App.tsx·스토어·구독 훅 수정 |
| [agent_docs/firebase-patterns.md](agent_docs/firebase-patterns.md) | firestoreRequest 패턴, `in` 쿼리 10개 제한, 초기화 함정 | Firebase 서비스 레이어 작업 |
| [agent_docs/testing.md](agent_docs/testing.md) | 테스트 전략 (Maestro E2E, functions 테스트) | 테스트 작성/수정 |
| [agent_docs/environment.md](agent_docs/environment.md) | 설치 함정, 환경 변수 목록 | 환경 셋업·의존성 문제 |
| [agent_docs/features/](agent_docs/features/) | 기능별 동작 설명 (카트 아이템 등) | 해당 기능 수정·분석 |

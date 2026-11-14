# 제재 통지 · 이의 신청

> 이슈: 없음
> 작업 종류: 기능 개발
> 상태: 진행중
> 생성일: 2026-11-15
> 참조: [설계 문서](design.md), 시안 https://claude.ai/artifact/RRybMR1VfHYg6qgvnKKHvv (Design 캔버스, 비공개)

## 개요

지금은 신고 수만으로 계정이 자동 정지되고, 정지된 사용자는 사유 없는 Alert만 보고 로그아웃된다. 이 작업은 자동 정지를 없애고, 관리자가 위반 유형을 골라 경고(글 비공개)와 정지를 걸게 한다. 사용자는 경고·정지 화면에서 무엇 때문에 어떤 조치를 받았는지 보고, 앱 안에서 이의를 신청해 운영자 답변을 받는다. 정책·문구·화면 결정은 [설계 문서](design.md)와 [spec.md](spec.md)가 기준이다.

- 포함: 위반 유형 6개, 조치(제재) 기록, 자동 정지 폐지, 관리자 경고·정지·이의 신청 처리, 사용자 경고·정지 화면, 이의 신청, 문의 내역, 공용 운영 정책 페이지, 이용약관 제5조
- 제외: 매너 평가 확장, 도배 자동 차단, 앱 안 일반 문의, 기존 "~해주세요" 문구 정리
- PR 3개로 나눈다(Phase 1~2 = PR 1, Phase 3~4 = PR 2, Phase 5~6 = PR 3). 앱 출시는 PR 2·3을 묶는다.
- 코드 기준: 관리자 기능은 master에 병합되었다(#67, #69). 아래 경로는 모두 master 기준이다.

## 확인 필요

- [x] 작업 기준 브랜치 — 결정: 관리자 기능이 master에 병합되어, `origin/master`에서 `feat/sanction-appeal` 브랜치를 만들어 진행한다
- [ ] 푸시 문구 3종(경고 받음, 정지됨, 이의 신청 결과) 제목·본문 — 막는 항목: Phase 2 사용자 푸시, Phase 6 결과 푸시
- [ ] 관리자 토스트 문구(경고 처리 완료/정지 완료/조치 유지·취소 완료와 각 실패) — 막는 항목: Phase 2·6 mutation 훅
- [ ] 문의 내역 빈 상태 문구 — 막는 항목: Phase 5 문의 내역 화면
- [ ] 이의 신청 인용(조치 취소) 후 사용자 안내: 푸시만 / 앱 진입 시 토스트도 — 막는 항목: Phase 6 결과 푸시

## Phase 1: 위반 유형 · 조치 데이터 기반 (PR 1)

- [x] 위반 유형 6개 상수와 사용자용 정책 문구(제목·설명·✕/✓ 예시) 정의 (`src/constants/sanction.ts` 신규)
  - 패턴: `src/constants/post.ts`의 `REPORT_CATEGORIES`처럼 `{ KR, EN }` 배열 + `as const`
  - 결정: 문구는 시안 '운영 정책 (사용자 · 관리자 공용)' 보드가 기준(사용자 확정). 심각도(높음/중간/낮음)는 관리자 전용 필드로 둔다
- [x] 신고 카테고리를 6개 유형 + 기타로 교체 (`src/constants/post.ts`, `src/types/report.ts`, `src/components/Admin/reportMeta.ts`, `functions/src/notifications/report.ts`)
  - 패턴: `reportMeta.ts`의 `CATEGORY_TONES`와 Functions의 `REPORT_CATEGORY_KR`가 앱 상수와 같은 값을 따로 들고 있다. 둘 다 함께 바꾼다
  - 재사용: `ReportModal`(`src/components/PostDetail/ReportModal.tsx`)은 `REPORT_CATEGORIES`를 그대로 그린다
  - 결정: 사유가 7개로 늘어 60% 높이에서는 작은 화면에서 마지막 항목이 잘리므로, `ReportModal` 시트 높이를 75%로 올린다(코드 리뷰 후 사용자 지시)
  - 결정: 기존 신고의 `fraud/abuse/spam/inappropriate/other` 값은 그대로 읽혀야 한다. 기존 값은 새 유형으로 매핑하고 모르는 값은 '기타'로 표시
  - 결정: 기존 5개 값을 새 유형의 EN 값으로 그대로 쓰고 `externalTrade`·`personalInfo`만 추가해, 옛 신고 데이터는 변환 없이 읽힌다. `REPORT_CATEGORIES`는 `as const`를 붙이지 않아 `ReportModal` 수정 없이 동작한다
- [x] 조치(Sanction)·이의 신청(Appeal) 타입 정의 (`src/types/sanction.ts` 신규, `functions/src/` 쪽 대응 타입)
  - 패턴: `src/types/report.ts`처럼 `Timestamp` 필드 + 생성 요청 타입 분리
  - 필드 최소 범위는 설계 문서 5장. 저장 위치(최상위 `Sanctions` 컬렉션 권장, 이의 신청은 조치 문서 안 필드 또는 하위 문서)는 구현 시 정하고 `결정:`으로 남긴다
  - 결정: 최상위 `Sanctions` 컬렉션에 저장하고, 이의 신청은 조치 1건당 1개라 조치 문서의 `appeal` 필드로 둔다(조치와 이의 신청을 한 번에 읽는다). '만료'는 저장하지 않고 `createdAt`으로 계산한다. Functions 쪽 타입은 `functions/src/types/sanction.ts`
- [x] 보안 규칙 (`firestore.rules`)
  - 패턴: 파일 하단 `isAdmin()` 함수, 관리자 필드 제한은 `affectedKeys().hasOnly([...])`
  - 조치 문서: 본인 read, 관리자 read, 쓰기는 Functions만(클라이언트 쓰기 금지)
  - **`Users` 본인 update에서 `report` 필드 쓰기 금지 추가**: 지금 규칙은 `role`만 막아서, 사용자가 자기 `report.suspendUntil`을 지워 정지를 풀 수 있다
  - 결정: 가입(create)에서도 `report`를 막는다. 클라이언트는 `report`를 쓰지 않고, 기본값은 신고 트리거가 만든다
- 검증: `npm run typecheck`, `npm --prefix functions run typecheck`, 에뮬레이터에서 일반 유저의 `Users.report` 쓰기·조치 문서 쓰기 거부 확인

## Phase 2: 자동 정지 폐지 · 관리자 조치 Functions (PR 1)

- [ ] 신고 트리거에서 자동 정지 제거 (`functions/src/triggers/reports.ts`의 `handleUserReport`)
  - 패턴: `total`·`recent30Days` 집계는 유지하고 `suspendUntil` 계산·`needsAdminReview` 설정·`handleUserPostsOnSuspension` 호출만 뺀다
- [ ] 관리자 경고·정지 callable (`functions/src/admin/sanction.ts` 신규, `functions/src/index.ts`)
  - 재사용: `assertAdmin`(index.ts), `handleUserPostsOnSuspension`·`liftUserSuspension`(`triggers/reports.ts`), `getKstMidnightAfterDays`
  - 패턴: `admin/suspension.ts`처럼 핸들러 파일 + index.ts에서 `functions.https.onCall` 래핑
  - 경고: 조치 기록 + 대상 글/댓글 `hiddenByAdmin` 숨김(채팅이면 숨김 없음). 정지: 조치 기록 + `Users.report.suspendUntil` 갱신(더 늦은 날 유지) + 전체 글 숨김
  - 권장 기간 계산(최근 90일 유효 조치 수 → 7일/30일/영구)도 이 파일에 둔다
- [ ] 정지 해제·만료를 조치 기록과 맞춤 (`functions/src/triggers/reports.ts`의 `liftUserSuspension`, `functions/src/schedulers/restoreSuspendedUserPostsScheduler.ts`)
  - 결정: [정지 해제]는 기간만 앞당기고 조치는 유효로 남긴다(설계 6장). 위반 대상 글은 `hiddenByAdmin`이라 지금 복구 로직에서 자연히 제외된다
- [ ] 경고·정지 시 사용자 푸시 (`functions/src/admin/sanction.ts`)
  - 재사용: `sendPushNotification`(`functions/src/utils/pushNotification.ts`), `data.url` 딥링크 패턴은 `functions/src/notifications/comments.ts`
- 검증: `npm --prefix functions run build`, `npm --prefix functions test`(에뮬레이터) — 신고 생성 시 정지가 걸리지 않음, 경고·정지 callable이 조치 문서와 `suspendUntil`을 기대대로 남김

## Phase 3: 관리자 정지 바텀시트 · 제재 이력 (PR 1)

- [ ] 관리자 서비스·훅 (`src/firebase/services/adminService.ts`, `src/hooks/admin/mutation/useIssueSanction.ts`, `src/hooks/admin/query/useUserSanctions.ts`)
  - 재사용: `liftSuspension`과 같은 `httpsCallable` 패턴, `useLiftSuspension`의 invalidate 목록
  - 패턴: 목록 조회는 `fetchUserReports` + `useInfiniteQuery` 커서 방식
- [ ] 정지 바텀시트 + 위반 유형 선택 (`src/components/Admin/SuspendSheet.tsx` 신규) — 시안: '관리자 — 정지 바텀시트', '… › 위반 유형 선택'
  - 재사용: `CustomBottomSheet`(`src/components/ui/CustomBottomSheet.tsx`)의 `title`·`leftButton`·`rightButton`, 유형 목록 스타일은 `ReportModal`의 `categoryButton`/`selectedCategory`
  - 결정: 메인 시트에서 '위반 유형' 행을 누르면 유형 선택 단계로 넘어가고, 헤더 [이전]/[완료]로 돌아온다(사용자 지시)
- [ ] 유저 상세에 [정지] 버튼과 제재 이력 (`src/screens/admin/AdminUserDetail.tsx`) — 시안: '관리자 — 유저 상세 정지 버튼', '… (정지된 유저)'
  - 재사용: `DangerActionPanel`, `isSuspended`(`SuspensionBadge.tsx`), `ViewAllLink`
  - 결정: 정지 중이 아니면 패널 배경을 `bg.fill`, 정지 중일 때만 `bg.danger`(사용자 지시). 제재 이력 행은 '칩 하나' 형식(조치 칩 / 위반 유형 / 글 제목 / 날짜)
- [ ] 신고 상세의 [숨기기]에 위반 유형 선택을 붙여 경고로 처리 (`src/screens/admin/AdminReportDetail.tsx`)
  - 재사용: 위 `SuspendSheet`의 유형 선택 단계, 기존 `useSetPostHidden`/`useSetCommentHidden` 대신 경고 callable 호출
- 검증: `npm run typecheck`, `npm run lint`, 에뮬레이터 관리자 계정으로 경고·정지·정지 해제 후 제재 이력 표시 확인

## Phase 4: 사용자 경고 · 정지 화면, 운영 정책 (PR 2)

- [ ] 사용자 조치 조회 서비스·훅 (`src/firebase/services/sanctionService.ts` 신규, `src/hooks/sanction/query/`)
  - 패턴: `firestoreRequest` 래핑(`src/firebase/core/firebaseInterceptor.ts:7`), 도메인별 `hooks/{domain}/query|mutation`
- [ ] 공용 정책 카드 컴포넌트 (`src/components/Sanction/PolicyCard.tsx` 신규)
  - 결정: 경고 화면과 운영 정책 페이지가 같은 컴포넌트를 쓴다(사용자 지시). ✕/✓ 아이콘과 보조 문구 지원
- [ ] 운영 정책 화면 (`src/screens/OperationPolicy.tsx` 신규, `src/navigation/RootStackNavigator.tsx`, `src/types/navigation.d.ts`) — 시안: '운영 정책 (사용자 · 관리자 공용)'
  - 패턴: `TermsOfService`·`PrivacyPolicy`처럼 RootStack `commonOptions` 화면 + `navigateToXxx` 헬퍼
  - 결정: 관리자 라우트가 아닌 일반 라우트(사용자 지시)
- [ ] 경고 화면 (`src/screens/SanctionWarning.tsx` 신규) — 시안: '대안 C … copy', 'copy 2'
  - 결정: 채팅 위반은 제목 "운영 정책 위반으로 경고를 받았습니다", 대상 카드 없음(사용자 지시)
- [ ] 정지 화면 (`src/screens/Suspended.tsx` 신규) — 시안: '처분', '이의 신청 작성 완료 & 운영자 검토', '결과 안내'
  - 재사용: 진행 단계 표시는 시안 구조를 컴포넌트로(`src/components/Sanction/ProgressSteps.tsx`)
- [ ] 진입 처리: `useSuspensionGuard` Alert 대체 + 미확인 경고 표시 (`src/hooks/shared/useSuspensionGuard.ts`, `App.tsx`)
  - 패턴: `AdminGuard`의 `navigation.reset` 방식으로 정지 화면만 남긴다
- [ ] 이용약관 제5조 수정 (`src/screens/TermsOfService.tsx`)
  - 결정: 내부 횟수 기준 미노출, "단계적 제한", "앱 안에서 이의 신청" 수준(설계 5장)
- 검증: `npm run typecheck`, `npm run lint`, 에뮬레이터에서 경고·정지 계정으로 앱 진입 시 각 화면 표시 확인. 라이트·다크 모드 확인

## Phase 5: 이의 신청 · 문의 내역 (PR 3)

- [ ] 이의 신청 callable (`functions/src/sanction/appeal.ts` 신규, `functions/src/index.ts`)
  - 결정: 조치 1건당 1회, 기한(정지는 해제일, 경고·영구는 30일) 검증을 서버에서 한다(설계 6장)
  - 재사용: 신고 접수 관리자 푸시(`functions/src/notifications/report.ts`) 패턴으로 관리자 푸시
- [ ] 이의 신청 작성 화면 (`src/screens/AppealForm.tsx` 신규) — 시안: '이의 신청 작성'
  - 패턴: React Hook Form + Zod(1000자 제한), 기존 폼 훅 위치 `src/hooks/{domain}/form/`
- [ ] 문의 내역 화면 (`src/screens/Inquiries.tsx` 신규, `src/screens/Setting.tsx`)
  - 재사용: `SettingListItem`으로 설정 진입점, 목록 행은 관리자 제재 이력 '칩 하나' 행을 사용자용으로
  - 결정: 탭 없이 칩으로 구분(사용자 지시). 행을 누르면 정지 화면과 같은 섹션 컴포넌트로 상세 표시
- [ ] 경고·정지 화면의 [이의 신청] 연결 (Phase 4 화면들)
- 검증: `npm --prefix functions test`(중복 신청·기한 초과 거부), 앱에서 신청 → 정지 화면 '검토 중' 표시 확인

## Phase 6: 관리자 이의 신청 처리 (PR 3)

- [ ] 이의 신청 결정 callable (`functions/src/admin/sanction.ts`)
  - 조치 유지: 답변 저장. 조치 취소: 조치 상태 취소 + 정지 기간 재계산 + 대상 글 `hiddenByAdmin` 해제
  - 결과 푸시: 사용자에게, 문의 내역 해당 항목 딥링크
- [ ] 이의 신청 상세 화면 (`src/screens/admin/AdminAppealDetail.tsx` 신규) — 시안: '이의 신청 검토 시안 1', '… copy'
  - 재사용: `AdminReportDetail`의 섹션 구조, 이의 신청·결과 안내 섹션은 Phase 4 사용자 컴포넌트
  - 결정: 버튼은 [조치 유지] / [조치 취소](사용자 지시). 답변은 결과 안내 카드 안 입력란
- [ ] 진입점 2곳 연결 (`src/screens/admin/AdminUserDetail.tsx`의 제재 이력 행, `src/screens/admin/AdminReviewUsers.tsx`)
- [ ] '검토 필요 유저' 기준 교체 (`src/firebase/services/adminService.ts`의 `fetchNeedsReviewUsers`, `src/screens/admin/AdminReviewUsers.tsx`)
  - 결정: 처리 대기 이의 신청이 있는 유저 + 미처리 신고가 있는 유저(설계 3-3). 안내 문구 "30일 자동 정지된 유저" 삭제
- 검증: `npm run typecheck`, `npm run lint`, `npm --prefix functions test`, 에뮬레이터에서 신청 → 관리자 조치 취소 → 사용자 정지 해제·글 복구·문의 내역 결과 표시 확인

## 진행 기록

### 2026-11-15

- Phase 1 완료
- 검증: `npm run typecheck`, `npm --prefix functions run typecheck` 통과. 별도 포트의 Firestore 에뮬레이터에서 REST로 9개 항목 확인(본인 `Users.report` 수정·삭제, `report` 포함 가입, 다른 유저의 조치 읽기, 조치 문서 생성·수정 거부 / 본인 프로필 수정, 본인 조치 읽기 허용) 모두 통과

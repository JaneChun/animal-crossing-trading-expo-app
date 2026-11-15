# 신고·조치 처리 4단계 목록

> 이슈: 없음
> 작업 종류: 기능 수정
> 상태: 대기
> 생성일: 2026-11-15
> 참조: [제재 통지 · 이의 신청](../../sanction-appeal/plans/tasks.md)

## 개요

지금은 신고의 처리 상태(`Reports.resolved`)와 조치(`Sanctions`의 발급, 유저 확인, 이의 신청, 관리자 결정)가 서로 연결되어 있지 않다. 그래서 관리자는 신고 → 피신고자 → 조치 이력으로 옮겨 다니며 진행 상황을 확인하고, 조치를 건 뒤에도 신고마다 [처리 완료]를 직접 눌러야 한다.

관리자 화면을 **검토 필요 → 유저 확인 대기 → 답변 필요 → 처리 완료** 4단계 목록으로 바꾸고, 단계 이동은 조치 발급·유저 확인·이의 신청·관리자 결정에 맞춰 자동으로 일어나게 한다. 조치를 걸면 같은 대상의 미처리 신고를 모두 조치에 연결해 함께 처리 완료하고, 채팅·프로필 신고에도 경고를 걸 수 있게 한다.

- 포함: 조치 단계 필드와 단계 이동 함수, 신고–조치 연결, 신고 상세의 경고/정지/처리 완료, 조치 상세(이의 신청 상세를 넓힘), 4단계 목록, 관리자 홈 메뉴 정리
- 제외: 사용자 화면(경고·정지·문의 내역)은 바꾸지 않는다. 조치 기준(90일 위반 횟수와 권장 조치)도 그대로 둔다
- 이 기능(`feat/sanction-appeal`)은 아직 배포 전이라 기존 `Sanctions` 문서가 운영 DB에 없다. 단계 필드 마이그레이션은 하지 않는다

## Phase 1: 단계 필드 · 신고–조치 연결 데이터

- [ ] 조치 단계 타입과 필드 추가 (`src/types/sanction.ts`, `functions/src/types/sanction.ts`, `src/constants/sanction.ts`)
  - 패턴: 두 타입 파일은 같은 구조를 손으로 맞춘다(`functions/src/types/sanction.ts` 첫 줄 주석). `SanctionDoc`/`Sanction`에 `reviewStage: 'awaitingUser' | 'awaitingReply' | 'done'` 추가
  - 재사용: 단계 이름(탭 라벨)은 `SANCTION_KINDS`처럼 `{ KR, EN }` 배열 상수로 둔다
- [ ] 신고에 연결된 조치 ID 필드 추가 (`src/types/report.ts`)
  - 패턴: `Report`에 `sanctionId?: string`. `CreateReportRequest`의 `Omit` 목록에 넣어 앱이 쓰지 않게 한다(`snapshot`과 같은 방식)
- [ ] 보안 규칙: 신고자는 `sanctionId`를 쓰거나 바꿀 수 없고, 관리자는 지금처럼 `resolved`만 바꾼다. `Sanctions`의 `reviewStage`는 함수만 쓴다 (`firestore.rules`)
  - 패턴: `Reports` update 규칙의 `!...affectedKeys().hasAny(['snapshot'])`에 `'sanctionId'`를 더한다. `Sanctions`는 본인 update가 이미 `hasOnly(['acknowledgedAt'])`라 그대로 막힌다
- [ ] 인덱스: `Sanctions` `reviewStage` + `createdAt` desc (`firestore.indexes.json`)
  - 패턴: 기존 `Sanctions` `userId` + `createdAt` desc 인덱스 옆에 같은 형식으로 추가
- [ ] 같은 신고자가 같은 유저를 다시 신고할 때, 기존 신고가 조치에 연결되어 있으면 덮어쓰지 않고 새 신고를 만든다 (`src/firebase/services/reportService.ts`)
  - 패턴: `createReport`의 `existingReports.length === 0` 분기. 연결된 신고를 덮어쓰면 `resolved: false`로 돌아가 조치가 끝난 신고가 '검토 필요'에 다시 나타난다

## Phase 2: 단계 이동 Functions

- [ ] 조치 발급 시 단계 설정과 근거 신고 연결 (`functions/src/admin/sanction.ts`의 `issueSanctionHandler`)
  - 패턴: 같은 `batch`에서 조치 문서를 쓰고, 근거 신고마다 `resolved: true`, `sanctionId`를 기록한다
  - 결정: 근거 신고는 요청의 `reportIds`를 그대로 믿지 않고 서버가 정한다. 같은 피신고자·같은 대상(`collectionName`/`postId`/`commentId`/`replyId`/`chatId`가 모두 같음)의 미처리 신고만 연결한다. 대상 없는 정지('대상 없음')는 신고를 연결하지 않는다(사용자 지시: 다른 대상의 신고는 따로 처리하고, 대상 없는 정지는 운영자 직접 처분 경로다).
  - 결정: 경고는 '유저 확인 대기', 정지(7일·30일·영구)는 발급 즉시 '처리 완료'로 둔다(사용자 지시: 정지 중에는 관리자가 할 일이 없고, 영구 정지는 기간 만료가 없다). 이의 신청이 오면 정지도 '답변 필요'로 간다. `Reports`를 `reporteeId ==` + `resolved == false`로 읽고 대상은 메모리에서 비교한다(등호 조건 둘이라 복합 인덱스 불필요)
- [ ] 이의 신청 접수 시 '답변 필요' (`functions/src/sanction/appeal.ts`의 `submitAppealHandler`)
  - 패턴: 기존 트랜잭션의 `transaction.update`에 `reviewStage: 'awaitingReply'`를 함께 쓴다. '처리 완료'에서 신청해도 같은 경로로 되돌아간다
- [ ] 이의 신청 결정·조치 취소 시 '처리 완료' (`functions/src/admin/sanction.ts`의 `decideAppealHandler`, `cancelSanctionHandler`)
  - 패턴: `decideAppealHandler`의 `appealUpdate`와 `cancelSanction`의 마지막 `sanctionRef.update`에 `reviewStage: 'done'`을 더한다(상태를 마지막에 바꾸는 기존 순서 유지)
- [ ] 유저가 경고를 확인하면 '처리 완료': `Sanctions` update 트리거 신설 (`functions/src/triggers/sanctions.ts` 신규, `functions/src/index.ts`)
  - 패턴: `onDocumentUpdated`. `before`에 `acknowledgedAt`이 없고 `after`에 있으며 `reviewStage == 'awaitingUser'`일 때만 `done`으로 바꾼다. 앱의 확인 기록(`sanctionService.acknowledgeSanction`)과 보안 규칙은 그대로 둔다
  - 재사용: 트리거 등록 형식은 `index.ts`의 `onReportWritten`(`onDocumentWritten('Reports/{reportId}', ...)`)
- [ ] 이의 신청 기한(조치일 + 30일)이 지난 '유저 확인 대기' 경고를 '처리 완료'로 (`functions/src/schedulers/expireUnacknowledgedWarningsScheduler.ts` 신규, `functions/src/index.ts`)
  - 결정: 앱을 열지 않아 확인하지 않은 경고도 기한이 지나면 처리 완료로 보낸다(사용자 지시)
  - 재사용: `restoreSuspendedUserPostsScheduler`(매일 0시 KST `onSchedule`), 기한 계산은 `functions/src/sanction/appeal.ts`의 `getAppealDeadline`
- [ ] 테스트 (`functions/__tests__/admin/sanction.integration.test.ts`, `functions/__tests__/sanction/appeal.integration.test.ts`, `functions/__tests__/triggers/sanctions.integration.test.ts` 신규)
  - 패턴: 개발용 에뮬레이터(8080)가 아니라 격리 에뮬레이터에서 실행한다(`agent_docs/testing.md`의 함정 참고: 헬퍼가 `Reports` 컬렉션 전체를 지운다)

## Phase 3: 앱 서비스 · 훅

- [ ] 단계별 조치 목록 조회 (`src/firebase/services/adminService.ts`, `src/hooks/admin/query/useStageSanctions.ts` 신규)
  - 재사용: `fetchReports`의 `fetchPage` + `useAdminReports`의 무한 스크롤 훅 형태(`InfiniteList`가 받는 값과 같음)
- [ ] 신고 상세용: 같은 대상의 미처리 신고, 연결된 조치 조회 (`adminService.ts`, `src/hooks/admin/query/` 신규 훅)
  - 재사용: 조치 조회는 `fetchSanction`/`useAdminSanction`, 신고 묶음은 `fetchReportsByIds`/`useSanctionReports`
- [ ] 쓰지 않게 되는 조회 정리: `fetchNeedsReviewUsers`/`useNeedsReviewUsers`, `fetchActiveWarningForReport`/`useReportWarning` (`adminService.ts`, `src/hooks/admin/query/`)
  - 결정: 신고 상세의 [숨김 해제]로 경고를 취소하던 경로는 조치 상세의 [조치 취소]로 옮긴다(Phase 4·5). 이 훅들을 쓰는 화면이 모두 바뀐 뒤 지운다
- [ ] 조치 발급·결정·취소 후 무효화할 캐시에 단계 목록을 더한다 (`src/hooks/admin/mutation/useIssueSanction.ts`, `useDecideAppeal.ts`, `useCancelSanction.ts`, `useSetReportResolved.ts`)
  - 패턴: 각 훅의 `onSuccess`에 있는 `invalidateQueries` 목록

## Phase 4: 신고 상세 (검토 필요 상세)

- [ ] 조치 패널을 [경고] / [계정 정지] 두 행으로 바꾼다. 채팅·프로필 신고도 경고할 수 있다 (`src/screens/admin/AdminReportDetail.tsx`의 `ReportActionsSection`)
  - 재사용: `DangerActionPanel`, 경고는 지금의 [숨기기] 흐름(`ViolationTypeSheet` → 확인 Alert → `useIssueSanction`)을 그대로 쓰고 대상만 신고에서 만든다(채팅이면 `{ chatId }`)
  - 결정(문구, 사용자 확정): [경고] 행 "경고" / "{게시글·댓글·답글}을 숨기고 경고합니다"(채팅·프로필은 "경고합니다"), [계정 정지] 행 "계정 정지" / "기간을 정해 계정을 정지합니다"
  - 결정: 채팅 신고 경고는 이전 계획 spec의 '채팅 신고에서 경고를 거는 방법' A안(신고 상세에 [경고] 추가)으로 정해졌다(사용자 지시)
- [ ] 신고 상세의 [계정 정지]는 '계정 정지' 화면을 지금 신고가 미리 선택된 상태로 연다 (`AdminReportDetail.tsx`)
- [ ] '근거 신고 N건' 섹션: 같은 대상의 미처리 신고를 모두 보여 준다(미처리 신고일 때) (`AdminReportDetail.tsx`)
  - 재사용: `AdminAppealDetail.tsx`의 '근거 신고 N건' 행 렌더링(신고 상세 내용 1줄 + "{카테고리} · {MM.DD}" + ›). 같은 모양이 두 곳에서 쓰이므로 `src/components/Admin/`의 컴포넌트로 뽑는다
- [ ] 하단 버튼: 미처리면 [조치 없이 처리 완료], 조치로 처리된 신고면 '연결된 조치' 카드(→ 조치 상세), 조치 없이 끝낸 신고면 [미처리로 되돌리기] (`AdminReportDetail.tsx`)
  - 재사용: '연결된 조치'는 유저 조치 이력 목록과 같은 행 컴포넌트, 처리 상태 변경은 `useSetReportResolved`
  - 결정: '연결된 조치'는 `SummaryLinkCard` 대신 조치 이력 목록의 행을 재사용한다(사용자 지시)
  - 결정(문구, 사용자 확정): 미처리 신고의 버튼 "조치 없이 처리 완료"
  - 패턴: 조치에 연결된 신고는 관리자 규칙상 `resolved`만 바꿀 수 있어도 되돌리지 않는다(되돌리려면 조치를 취소한다)
- [ ] '신고된 댓글' 아래 원문 게시글 카드를 `PostSummary` 모양(썸네일 + 배지 + 제목 + 원형 화살표)으로 바꾼다 (`AdminReportDetail.tsx`)
  - 재사용: `src/components/Chat/PostSummary.tsx`
  - 결정: 원문 게시글 카드는 `SummaryLinkCard` 대신 `PostSummary`를 쓴다(사용자 지시)
- [ ] 이전 데이터 처리: 조치 없이 관리자가 숨긴 글·댓글(이번 기능 전 숨김)에는 지금의 [숨김 해제]를 남긴다 (`AdminReportDetail.tsx`)
  - 패턴: 지금의 `isHiddenByAdmin` 분기 중 `unhide` fallback(`setPostHidden(false)`/`setCommentHidden(false)`)만 남긴다

## Phase 5: 조치 상세 · 4단계 목록

- [ ] 이의 신청 상세를 조치 상세로 넓힌다: 이의 신청이 없을 때는 '유저 반응'(확인 시각 또는 미확인)과 [조치 취소]를 보여 준다 (`src/screens/admin/AdminAppealDetail.tsx` → `AdminSanctionDetail.tsx`, `src/navigation/RootStackNavigator.tsx`, `src/types/navigation.d.ts`, `src/utilities/navigationHelpers.ts`, `App.tsx`)
  - 재사용: `SanctionSummarySection`/`AppealSection`/`AppealResultSection`, 취소는 `useCancelSanction`
  - 결정(문구, 사용자 확정): 헤더 "조치 상세", 섹션 "유저 반응"("{날짜} 정책 확인" / "아직 확인하지 않았습니다"), [조치 취소] 확인 Alert "조치를 취소할까요?" / "정지가 해제되고 숨긴 글이 다시 공개되며, 위반 횟수에서 빠집니다."
  - 결정: 라우트 이름은 `AdminSanctionDetail`로 바꾸되 딥링크 경로 `admin/appeal/:sanctionId`는 유지한다(이미 보낸 관리자 푸시가 이 경로를 쓴다)
- [ ] 조치 목록 행 컴포넌트 (`src/components/Admin/SanctionListItem.tsx` 신규)
  - 재사용: `ReportListItem`의 행 구조(배지 줄 + 본문 + 날짜), 조치 칩은 `SanctionHistoryList`의 칩 계산
- [ ] 신고 관리 화면을 4개 탭으로 (`src/screens/admin/AdminReports.tsx`)
  - 재사용: 지금의 `createMaterialTopTabNavigator` 설정과 `InfiniteList`. '검토 필요' 탭은 지금의 '접수' 탭(`resolved == false`)
  - 결정: '처리 완료' 탭 안을 [조치] / [조치 없음] 칩으로 나눠, 조치 없이 끝낸 신고(`resolved == true`이고 `sanctionId` 없음)도 함께 보여 준다(사용자 지시). 조치 없음 목록은 `Reports`를 `resolved == true`로 읽고 `sanctionId`가 있는 신고는 메모리에서 거른다
  - 결정(문구, 사용자 확정): 탭 '검토 필요' / '확인 대기' / '답변 필요' / '처리 완료', 빈 목록 "검토할 신고가 없습니다." / "확인을 기다리는 조치가 없습니다." / "답변할 이의 신청이 없습니다." / "처리 완료된 항목이 없습니다."
- [ ] 관리자 홈 메뉴를 하나로 합치고 '검토 필요 유저' 화면을 지운다 (`src/screens/admin/AdminHome.tsx`, `src/screens/admin/AdminReviewUsers.tsx` 삭제, 라우트·내비게이션 헬퍼)
  - 결정(문구, 사용자 확정): '신고 관리'와 '검토 필요 유저'를 '신고·조치 관리' 하나로 합친다
- [ ] 유저 상세의 '조치 이력'을 요약 + 목록 화면으로 바꾼다: 경고·정지 수 요약과 [조치 이력 보기] → 조치 이력 목록, 목록의 모든 행이 조치 상세로 간다. 조치 이력과 계정 정지 패널은 화면 맨 아래로 옮긴다 (`src/screens/admin/AdminUserDetail.tsx`, `src/screens/admin/AdminUserRecords.tsx`, `src/components/Admin/SanctionHistoryList.tsx`) — 시안: 캔버스 '관리자 — 유저 상세 정지 버튼', '관리자 — 유저 조치 이력 목록'
  - 재사용: 요약은 리뷰·신고·차단 섹션과 같은 `StatStrip` + `ViewAllLink`, 목록은 `AdminUserRecords`에 `kind: 'sanctions'`를 더해 '처리 완료' 탭의 조치 행을 쓴다(유저 이름 대신 현재 단계 칩)
  - 결정(문구, 사용자 지시): 관리자 화면의 '제재'는 '조치'로 통일한다 — 섹션 제목 "조치 이력", 링크 "조치 이력 보기", 버튼 "조치 없이 처리 완료", 칩 "조치 없음"
- [ ] '계정 정지' 화면을 새로 만들고 정지 바텀시트를 대체한다: 위반 유형 목록 → 근거 신고('대상 없음' + 받은 미처리 신고) → 정지 기간 → [{기간} 정지하기] (`src/screens/admin/AdminSuspend.tsx` 신규, `src/components/Admin/SuspendSheet.tsx` 삭제, `AdminUserDetail.tsx`, 라우트·`src/types/navigation.d.ts`·내비게이션 헬퍼) — 시안: 캔버스 '관리자 — 계정 정지 화면'
  - 재사용: 위반 유형은 `ViolationTypeList`, 신고 행은 `ReportListItem`, 목록 조회는 `fetchUserReports`(유저 상세 '신고 내역 보기'와 같은 조회)에서 미처리만 쓴다. 기간 선택·권장 안내·발급 호출은 `SuspendSheet.tsx`의 것을 옮긴다
  - 패턴: 고른 신고의 대상을 `issueSanction` 요청의 `target`으로 넣는다. '대상 없음'이면 `target`을 비운다. 근거 신고는 서버가 정하므로 앱은 보내지 않는다
  - 결정: 바텀시트 대신 stack 화면(사용자 지시: 신고 목록이 길어질 수 있음). 게시글·댓글·채팅을 따로 고르지 않고 받은 신고에서 고르며, 직접 처분용으로 '대상 없음'을 둔다(사용자 지시)
- [ ] 유저 목록에 검색 입력칸: 닉네임 앞부분으로 유저를 찾아 유저 상세로 간다 (`src/screens/admin/AdminUsers.tsx`, `src/firebase/services/adminService.ts`, `src/hooks/admin/query/` 신규 훅)
  - 패턴: 지금 `fetchUsers`는 `lastActiveAt` 정렬 페이지 조회뿐이다. 닉네임은 `orderBy('displayName')` + `startAt(q)` + `endAt(q + '\uf8ff')` 앞부분 일치로 찾는다(단일 필드라 인덱스 추가 불필요)
  - 결정(문구, 사용자 확정): 입력칸 안내 "닉네임으로 검색", 결과 없음 "검색 결과가 없습니다." UID 검색은 하지 않는다
  - 결정: 운영자가 신고 없이 직접 처분할 유저를 찾는 입구로 쓴다(사용자 지시)

## Phase 6: 문서

- [ ] 관리자 기능 문서에 4단계와 단계 이동 규칙을 반영한다 (`agent_docs/features/admin.md`)
- [ ] 이전 계획 spec의 '결정이 필요한 부분'(채팅 신고 경고)을 결정으로 정리한다 (`docs/sanction-appeal/plans/spec.md`)
  - 결정: 원본 plans는 고치지 않는 것이 원칙이지만, 이 결정은 같은 브랜치의 미결 항목이라 그 블록만 지우고 결정 한 줄을 남긴다(사용자 지시로 채팅 경고 A안 채택)

## 진행 기록

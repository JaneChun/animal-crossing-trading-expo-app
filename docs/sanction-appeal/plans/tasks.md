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
- [x] 푸시 문구 3종 — 결정(사용자 확정): 경고 "운영 정책 위반 안내" / "운영 정책 위반으로 게시글이 비공개 처리되었습니다. 앱에서 내용을 확인해 주세요."(채팅 대상이면 "운영 정책 위반으로 경고를 받았습니다. 앱에서 내용을 확인해 주세요."), 정지 "계정 이용 제한 안내" / "운영 정책 위반으로 계정 이용이 제한되었습니다. 앱에서 내용을 확인해 주세요.", 이의 신청 결과 "이의 신청 결과 안내" / "이의 신청 검토가 끝났습니다. 앱에서 내용을 확인해 주세요."
- [x] 관리자 토스트 문구 — 결정(사용자 확정): 성공 "경고 처리했습니다" / "{7일·30일·영구} 정지했습니다" / "조치를 유지했습니다" / "조치를 취소했습니다", 실패 "처리하지 못했습니다. 다시 시도해 주세요."
- [x] 문의 내역 빈 상태 문구 — 결정(사용자 확정): "문의 내역이 없습니다."
- [x] 이의 신청 인용(조치 취소) 후 사용자 안내 — 결정(사용자 확정): 결과 푸시만 보내고 앱 진입 시 토스트는 없음

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

- [x] 신고 트리거에서 자동 정지 제거 (`functions/src/triggers/reports.ts`의 `handleUserReport`)
  - 패턴: `total`·`recent30Days` 집계는 유지하고 `suspendUntil` 계산·`needsAdminReview` 설정·`handleUserPostsOnSuspension` 호출만 뺀다
  - 결정: `report`는 merge로 `total`(`FieldValue.increment`)·`recent30Days`만 쓰고 `suspendUntil`은 쓰지 않는다. 읽은 값을 다시 쓰면 동시에 들어온 신고나 관리자 정지를 덮어쓰기 때문이다(코드 리뷰). 신고 이력이 없던 유저는 `suspendUntil` 필드가 없고, 앱과 스케줄러는 이를 `null`과 같게 처리한다
- [x] 관리자 경고·정지 callable (`functions/src/admin/sanction.ts` 신규, `functions/src/index.ts`)
  - 재사용: `assertAdmin`(index.ts), `handleUserPostsOnSuspension`·`liftUserSuspension`(`triggers/reports.ts`), `getKstMidnightAfterDays`
  - 패턴: `admin/suspension.ts`처럼 핸들러 파일 + index.ts에서 `functions.https.onCall` 래핑
  - 경고: 조치 기록 + 대상 글/댓글 `hiddenByAdmin` 숨김(채팅이면 숨김 없음). 정지: 조치 기록 + `Users.report.suspendUntil` 갱신(더 늦은 날 유지) + 전체 글 숨김
  - 권장 기간 계산(최근 90일 유효 조치 수 → 7일/30일/영구)도 이 파일에 둔다
  - 결정: 권장 조치는 Phase 3 바텀시트가 쓰도록 callable `getSanctionRecommendation`으로 노출한다(계산 규칙을 앱에 복제하지 않기 위해)
  - 결정: 영구 정지는 조치 문서의 `suspendUntil`을 null로 두고, `Users.report.suspendUntil`에는 9999-12-31 KST 0시를 넣는다. 정지 판단과 만료 스케줄러를 기간 정지와 같은 방식으로 쓰기 위함이다
  - 결정: 정지도 위반 대상 글을 `hiddenByAdmin`으로 숨긴다(spec: 대상 글은 정지가 끝나도 비공개 유지). 채팅은 숨기지 않고 기록만 남긴다
  - 결정: 대상 문서의 `creatorId`가 조치 대상 유저와 다르면 거부한다. 신고 규칙이 `reporteeId`와 대상 글의 작성자가 같은지 검사하지 않아, 다른 유저의 글이 섞인 신고가 들어올 수 있기 때문이다(코드 리뷰)
  - 결정: 유저 정지일·대상 숨김을 트랜잭션으로 묶지 않는다. 동시에 처리되려면 관리자 두 명의 동시 조치나 0시 만료 스케줄러와의 충돌이 필요한데, 관리자가 1명이라 가능성이 거의 없다(코드 리뷰). 관리자를 늘리면 다시 검토한다
- [x] 정지 해제·만료를 조치 기록과 맞춤 (`functions/src/triggers/reports.ts`의 `liftUserSuspension`, `functions/src/schedulers/restoreSuspendedUserPostsScheduler.ts`)
  - 결정: [정지 해제]는 기간만 앞당기고 조치는 유효로 남긴다(설계 6장). 위반 대상 글은 `hiddenByAdmin`이라 지금 복구 로직에서 자연히 제외된다
  - 결정: 코드 변경 없음. 해제·만료는 `Users.report.suspendUntil`만 다루고 조치 문서는 건드리지 않으며, 영구 정지 날짜는 스케줄러 조건(`<= now`)에 걸리지 않는다
- [x] 답글 관리자 숨김 추가 (`functions/src/admin/sanction.ts`, `functions/src/triggers/replies.ts`, `src/firebase/services/replyService.ts`, `src/types/reply.ts`, `firestore.rules`)
  - 결정: 위반 답글을 공개된 채로 두지 않도록 답글도 숨긴다(사용자 지시). 계획에 없던 항목으로 코드 리뷰 중 추가했다
  - 패턴: 댓글과 같은 `hiddenByAdmin` + 목록에서 클라이언트 필터(`commentService`와 같은 방식), 작성자는 `hiddenByAdmin`을 바꿀 수 없음
  - 결정: 댓글 수는 숨길 때 한 번만 뺀다. 숨긴 댓글 아래 답글, 숨긴 답글이 있는 댓글, 숨긴 답글 삭제는 다시 빼지 않는다(앱 `setCommentHidden`의 답글 수 계산도 같이 맞춤)
- [x] 경고·정지 시 사용자 푸시 (`functions/src/admin/sanction.ts`)
  - 재사용: `sendPushNotification`(`functions/src/utils/pushNotification.ts`), `data.url` 딥링크 패턴은 `functions/src/notifications/comments.ts`
  - 결정: 경고 푸시 본문의 대상은 경고 화면 제목과 같은 기준으로, 글이면 '게시글', 댓글·답글이면 '댓글'로 쓴다(코드 리뷰, 사용자 확정 문구의 대상어만 바꿈)
  - 결정: 딥링크(`data.url`)는 넣지 않는다. 앱을 열면 Phase 4의 진입 처리가 경고·정지 화면을 띄우므로 별도 경로가 필요 없다. 푸시 실패는 로그만 남기고 조치는 성공으로 반환한다
- 검증: `npm --prefix functions run build`, `npm --prefix functions test`(에뮬레이터) — 신고 생성 시 정지가 걸리지 않음, 경고·정지 callable이 조치 문서와 `suspendUntil`을 기대대로 남김

## Phase 3: 관리자 정지 바텀시트 · 제재 이력 (PR 1)

- [x] 관리자 서비스·훅 (`src/firebase/services/adminService.ts`, `src/hooks/admin/mutation/useIssueSanction.ts`, `src/hooks/admin/query/useUserSanctions.ts`)
  - 재사용: `liftSuspension`과 같은 `httpsCallable` 패턴, `useLiftSuspension`의 invalidate 목록
  - 패턴: 목록 조회는 `fetchUserReports` + `useInfiniteQuery` 커서 방식
  - 결정: 제재 이력은 유저당 건수가 적어 페이지 없이 `useQuery`로 전체를 읽는다. `Sanctions`(userId + createdAt desc) 인덱스를 `firestore.indexes.json`에 추가했다(배포 필요). 권장 조치는 `useSanctionRecommendation`으로 시트를 열 때만 조회한다
  - 결정: 토스트는 기존 관리자 토스트처럼 마침표를 붙인다("경고 처리했습니다.", "7일 정지했습니다.")
- [x] 정지 바텀시트 + 위반 유형 선택 (`src/components/Admin/SuspendSheet.tsx` 신규) — 시안: '관리자 — 정지 바텀시트', '… › 위반 유형 선택'
  - 재사용: `CustomBottomSheet`(`src/components/ui/CustomBottomSheet.tsx`)의 `title`·`leftButton`·`rightButton`, 유형 목록 스타일은 `ReportModal`의 `categoryButton`/`selectedCategory`
  - 결정: 메인 시트에서 '위반 유형' 행을 누르면 유형 선택 단계로 넘어가고, 헤더 [이전]/[완료]로 돌아온다(사용자 지시)
  - 결정: 유저 상세에서 여는 정지에는 대상 글이 정해지지 않으므로 시안의 '대상 글' 행을 표시하지 않는다(대상 없는 정지로 기록). 단계 전환 시 시트를 다시 그리지 않도록 시트 하나에서 제목·버튼·내용만 바꾼다
  - 결정: 권장 조치가 경고(최근 90일 1회째)면 기간 선택지에 없으므로 7일을 기본 선택하고, 안내는 "…정책상 경고를 권장합니다."로 보여 준다
- [x] 유저 상세에 [정지] 버튼과 제재 이력 (`src/screens/admin/AdminUserDetail.tsx`) — 시안: '관리자 — 유저 상세 정지 버튼', '… (정지된 유저)'
  - 재사용: `DangerActionPanel`, `isSuspended`(`SuspensionBadge.tsx`), `ViewAllLink`
  - 결정: 정지 중이 아니면 패널 배경을 `bg.fill`, 정지 중일 때만 `bg.danger`(사용자 지시). 제재 이력 행은 '칩 하나' 형식(조치 칩 / 위반 유형 / 글 제목 / 날짜)
  - 결정: 영구 정지(`suspendUntil` 9999-12-31)는 날짜 대신 '영구 정지'로 표시한다. `formatKstMonthDay`는 연도를 버려 "12.31 0시까지"로 보이기 때문이다(`AdminUserDetail`·`AdminReportDetail`·`SuspensionBadge`)
  - 결정: 조치 버튼은 처리 중 비활성화한다. 더블 탭으로 조치 문서가 두 번 생기면 권장 조치 횟수가 올라간다
  - 결정: 제재 이력이 없으면 섹션을 그리지 않는다(빈 상태 문구 없음). 취소된 조치는 회색 '취소' 칩. 행을 눌렀을 때의 이동과 '이의 신청 검토 중' 링크는 Phase 6에서 붙인다
- [x] 신고 상세의 [숨기기]에 위반 유형 선택을 붙여 경고로 처리 (`src/screens/admin/AdminReportDetail.tsx`)
  - 재사용: 위 `SuspendSheet`의 유형 선택 단계, 기존 `useSetPostHidden`/`useSetCommentHidden` 대신 경고 callable 호출
  - 답글 신고에도 [숨기기]를 보여 준다(지금은 게시글·댓글에만 있음). 서버는 Phase 2에서 답글 숨김을 지원한다
  - 결정: [숨기기] → 위반 유형 시트(`ViolationTypeSheet`) [완료] → 기존 확인 Alert → 경고 조치. 숨김 해제는 기존 클라이언트 함수 그대로. 답글은 관리자가 앱에서 쓸 수 없어 숨김 해제 행이 없다(조치 취소로만 해제)
- 검증: `npm run typecheck`, `npm run lint`, 에뮬레이터 관리자 계정으로 경고·정지·정지 해제 후 제재 이력 표시 확인

## Phase 4: 사용자 경고 · 정지 화면, 운영 정책 (PR 2)

- [x] 사용자 조치 조회 서비스·훅 (`src/firebase/services/sanctionService.ts` 신규, `src/hooks/sanction/query/`)
  - 패턴: `firestoreRequest` 래핑(`src/firebase/core/firebaseInterceptor.ts:7`), 도메인별 `hooks/{domain}/query|mutation`
  - 결정: 경고 확인은 조치 문서의 `acknowledgedAt`에 기록한다. 보안 규칙은 본인이 이 필드 하나만, 서버 시각(`request.time`)으로만 쓸 수 있게 열었다(callable을 따로 만들지 않기 위해)
- [x] 공용 정책 카드 컴포넌트 (`src/components/Sanction/PolicyCard.tsx` 신규)
  - 결정: 경고 화면과 운영 정책 페이지가 같은 컴포넌트를 쓴다(사용자 지시). ✕/✓ 아이콘과 보조 문구 지원
- [x] 운영 정책 화면 (`src/screens/OperationPolicy.tsx` 신규, `src/navigation/RootStackNavigator.tsx`, `src/types/navigation.d.ts`) — 시안: '운영 정책 (사용자 · 관리자 공용)'
  - 패턴: `TermsOfService`·`PrivacyPolicy`처럼 RootStack `commonOptions` 화면 + `navigateToXxx` 헬퍼
  - 결정: 관리자 라우트가 아닌 일반 라우트(사용자 지시)
- [x] 경고 화면 (`src/screens/SanctionWarning.tsx` 신규) — 시안: '대안 C … copy', 'copy 2'
  - 결정: 채팅 위반은 제목 "운영 정책 위반으로 경고를 받았습니다", 대상 카드 없음(사용자 지시)
  - 결정: 글은 "이 글은 비공개 처리되었습니다", 댓글·답글은 "이 댓글은 비공개 처리되었습니다"(사용자 지시)
  - 결정: [이의 신청] 버튼은 Phase 5에서 붙인다. 확인 기록이 실패해도 화면은 닫고 다음 실행 때 다시 보여 준다. 확인하지 않은 경고가 여러 개면 최근 것부터 하나씩 띄운다
- [x] 정지 화면 (`src/screens/Suspended.tsx` 신규) — 시안: '처분', '이의 신청 작성 완료 & 운영자 검토', '결과 안내'
  - 재사용: 진행 단계 표시는 시안 구조를 컴포넌트로(`src/components/Sanction/ProgressSteps.tsx`)
  - 결정: 조치 내용·이의 신청·결과 안내 섹션은 Phase 5 문의 내역 상세에서도 쓰도록 `src/components/Sanction/SanctionSections.tsx`로 분리했다
  - 결정: 검토 중이면 진행 단계를 '이의 신청' 완료 + '운영자 검토' 현재로 표시한다(시안은 '이의 신청'을 현재로 둠). 이의 신청 기한 안내는 아직 신청하지 않았고 기한이 남았을 때만 보여 준다
  - 결정(검토 필요): 영구 정지는 시안이 없어 본문을 "운영 정책 위반으로 서비스를 이용할 수 없습니다."(자동 해제 문장 없음), 제한 기간을 "영구"로 표시한다. 기간 정지 시안 문구에서 기간 부분만 뺀 것이다
- [x] 진입 처리: `useSuspensionGuard` Alert 대체 + 미확인 경고 표시 (`src/hooks/shared/useSuspensionGuard.ts`, `App.tsx`)
  - 패턴: `AdminGuard`의 `navigation.reset` 방식으로 정지 화면만 남긴다
  - 결정: 앱 시작 시에는 내비게이터가 준비되지 않아 reset이 동작하지 않으므로, `RootStackNavigator`의 `initialRouteName`을 정지 중이면 `Suspended`로 둔다. 실행 중 정지(로그인 등)는 `useSuspensionGuard`가 `resetTo('Suspended')`로 처리한다. 경고 화면은 `RootStackNavigator`의 `useSanctionWarningNotice`가 띄운다(React Query가 필요해 `App`이 아닌 내비게이터 안에 둔다)
- [x] 이용약관 제5조 수정 (`src/screens/TermsOfService.tsx`)
  - 결정: 내부 횟수 기준 미노출, "단계적 제한", "앱 안에서 이의 신청" 수준(설계 5장)
  - 결정(검토 필요): 자동 정지 항목과 이메일 이의 제기 항목을 "위반 확인 후 경고·기간 정지·영구 정지 순으로 단계적 제한", "위반 유형과 제재 내용을 앱에서 안내", "앱 안에서 이의 신청, 결과를 앱으로 안내" 세 항목으로 바꿨다. 약관 문구라 배포 전에 확인이 필요하다
- 검증: `npm run typecheck`, `npm run lint`, 에뮬레이터에서 경고·정지 계정으로 앱 진입 시 각 화면 표시 확인. 라이트·다크 모드 확인

## Phase 5: 이의 신청 · 문의 내역 (PR 3)

- [x] 이의 신청 callable (`functions/src/sanction/appeal.ts` 신규, `functions/src/index.ts`)
  - 결정: 조치 1건당 1회, 기한(정지는 해제일, 경고·영구는 30일) 검증을 서버에서 한다(설계 6장)
  - 재사용: 신고 접수 관리자 푸시(`functions/src/notifications/report.ts`) 패턴으로 관리자 푸시
  - 결정: 두 번 눌러도 한 건만 접수되도록 조치 문서 읽기·쓰기를 트랜잭션으로 묶는다. 관리자 푸시는 "[관리자] 이의 신청 접수" / 신청 내용 앞 30자, 딥링크 `admin/appeal/{sanctionId}`(라우트는 Phase 6). 취소된 조치에는 신청할 수 없다
- [x] 이의 신청 작성 화면 (`src/screens/AppealForm.tsx` 신규) — 시안: '이의 신청 작성'
  - 패턴: React Hook Form + Zod(1000자 제한), 기존 폼 훅 위치 `src/hooks/{domain}/form/`
  - 결정: 빈 내용은 오류 문구 대신 [제출하기] 비활성화로 막는다. 입력란 높이는 키보드가 올라와도 버튼이 보이도록 시안(400)보다 낮은 240으로 둔다. 실패 토스트는 확정된 "처리하지 못했습니다. 다시 시도해 주세요."를 쓴다
- [x] 문의 내역 화면 (`src/screens/Inquiries.tsx` 신규, `src/screens/Setting.tsx`)
  - 재사용: `SettingListItem`으로 설정 진입점, 목록 행은 관리자 제재 이력 '칩 하나' 행을 사용자용으로
  - 결정: 탭 없이 칩으로 구분(사용자 지시). 행을 누르면 정지 화면과 같은 섹션 컴포넌트로 상세 표시
  - 결정: 상세는 별도 화면 `InquiryDetail`로 두고, 이의 신청할 수 있는 조치(경고 포함)면 [이의 신청] 버튼을 보여 준다. 설정의 '사용자 설정' 그룹 마지막에 '문의 내역'을 추가했다
- [x] 경고·정지 화면의 [이의 신청] 연결 (Phase 4 화면들)
  - 결정: 정지 중 가드가 이의 신청 작성·운영 정책 화면은 허용한다(그 외 화면은 정지 화면으로 되돌림). 버튼 노출 조건은 서버와 같은 `canAppeal`(유효, 미신청, 기한 내)
- 검증: `npm --prefix functions test`(중복 신청·기한 초과 거부), 앱에서 신청 → 정지 화면 '검토 중' 표시 확인

## Phase 6: 관리자 이의 신청 처리 (PR 3)

- [x] 이의 신청 결정 callable (`functions/src/admin/sanction.ts`)
  - 참고(Phase 3 코드 리뷰): 신고 상세의 [숨김 해제]는 지금 콘텐츠만 다시 공개하고 경고 조치는 유효로 남긴다. 실수로 숨긴 경우 횟수에 남으므로, 이 callable을 만들 때 [숨김 해제]가 해당 경고를 취소하도록 함께 바꾼다
  - 조치 유지: 답변 저장. 조치 취소: 조치 상태 취소 + 정지 기간 재계산 + 대상 글·댓글·답글 `hiddenByAdmin` 해제(댓글 수는 숨길 때 뺀 만큼 되돌림)
  - 결과 푸시: 사용자에게, 문의 내역 해당 항목 딥링크
  - 결정: 정지 재계산은 남은 유효 정지의 가장 늦은 해제일로 하되 해제일을 앞당기기만 한다(관리자가 이미 [정지 해제]한 유저를 다시 정지하지 않음). 남은 정지가 없으면 즉시 해제하고 정지 때 숨긴 글을 복구한다. 작성자가 아직 정지 중이면 대상 글은 관리자 숨김 표시만 지우고, 정지가 풀릴 때 복구된다
  - 결정: 신고 상세 [숨김 해제]용으로 이의 신청 없이 조치를 취소하는 `cancelSanction` callable을 함께 만들었다(Phase 3 리뷰 참고 항목). 결과 푸시 딥링크는 `inquiry/{sanctionId}`, 관리자 푸시는 `admin/appeal/{sanctionId}`로 `App.tsx` linking에 등록했다
- [x] 이의 신청 상세 화면 (`src/screens/admin/AdminAppealDetail.tsx` 신규) — 시안: '이의 신청 검토 시안 1', '… copy'
  - 재사용: `AdminReportDetail`의 섹션 구조, 이의 신청·결과 안내 섹션은 Phase 4 사용자 컴포넌트
  - 결정: 버튼은 [조치 유지] / [조치 취소](사용자 지시). 답변은 결과 안내 카드 안 입력란
  - 결정: 답변을 입력해야 결정 버튼이 활성화된다. 조치 내용·이의 신청·결과 안내는 사용자 화면의 `SanctionSections`를 쓰고, 관리자 화면은 신청 내용 전체를 보여 주며 재신청 불가 안내는 숨긴다. 시안의 '대상' 행 원문 링크는 넣지 않았다(근거 신고 행에서 신고 상세의 원문 링크로 이동 가능)
- [x] 진입점 2곳 연결 (`src/screens/admin/AdminUserDetail.tsx`의 제재 이력 행, `src/screens/admin/AdminReviewUsers.tsx`)
  - 결정: 이의 신청이 있는 제재 이력 행만 눌러지고, 검토 중이면 '이의 신청 검토 중 ›'을 보여 준다. 검토 필요 유저 목록은 이의 신청 대기 유저를 누르면 이의 신청 상세로, 미처리 신고만 있는 유저는 유저 상세로 간다
- [x] '검토 필요 유저' 기준 교체 (`src/firebase/services/adminService.ts`의 `fetchNeedsReviewUsers`, `src/screens/admin/AdminReviewUsers.tsx`)
  - 결정: 처리 대기 이의 신청이 있는 유저 + 미처리 신고가 있는 유저(설계 3-3). 안내 문구 "30일 자동 정지된 유저" 삭제
  - 참고: Phase 2부터 `needsAdminReview`를 더 이상 설정하지 않으므로, PR 1 배포 후 이 항목이 배포되기 전까지는 목록에 새 유저가 들어오지 않는다
  - 결정: 페이지 없이 모두 읽어 이의 신청 대기 → 미처리 신고 많은 순으로 정렬하고, 오른쪽 칩으로 '이의 신청' / '미처리 신고 N'을 구분한다. 안내 문구는 "처리를 기다리는 이의 신청이나 처리되지 않은 신고가 있는 유저입니다."로 바꿨다. 유저 상세의 '검토 필요'(`needsAdminReview`) 배지는 기준이 사라져 지웠다
- 검증: `npm run typecheck`, `npm run lint`, `npm --prefix functions test`, 에뮬레이터에서 신청 → 관리자 조치 취소 → 사용자 정지 해제·글 복구·문의 내역 결과 표시 확인

## 진행 기록

### 2026-11-15

- Phase 1 완료
- 검증: `npm run typecheck`, `npm --prefix functions run typecheck` 통과. 별도 포트의 Firestore 에뮬레이터에서 REST로 9개 항목 확인(본인 `Users.report` 수정·삭제, `report` 포함 가입, 다른 유저의 조치 읽기, 조치 문서 생성·수정 거부 / 본인 프로필 수정, 본인 조치 읽기 허용) 모두 통과
- Phase 2 완료(사용자 푸시 제외)
- 검증: `npm --prefix functions run typecheck`·lint 통과. 8085 포트의 별도 에뮬레이터에서 functions 전체 테스트 223개 통과(신규 `admin/sanction.integration.test.ts` 포함, 자동 정지 테스트는 '정지되지 않음' 테스트로 교체). `npm --prefix functions run build`는 권한 거부로 실행하지 못했다
- 블로커: 사용자 푸시 문구
- 결정: 코드 리뷰 후 `issueSanction` 요청 검증 강화(ID에 `/` 금지, `replyId`에는 `commentId` 필수, `target`은 정해진 키만 저장)
- 검증(답글 숨김 추가 후): `npm run typecheck`, functions typecheck·lint 통과. 별도 에뮬레이터에서 functions 테스트 223개, 보안 규칙 확인 13개(답글 `hiddenByAdmin` 본인 변경 거부 포함) 통과
- 결정(Phase 2 코드 리뷰): 숨긴 댓글 삭제 시 댓글 수 중복 차감은 반영하지 않는다. 숨긴 댓글·답글은 작성자 목록에서도 빠져 앱에서 삭제할 수 없다. 동시 조치·재시도 중복·`getSanctionRecommendation`의 `uid` 파라미터명도 앞선 결정대로 유지한다
- 검증(Phase 2 커밋 시점): 리뷰 반영분(푸시 문구, 댓글 삭제 답글 수, 읽기 병렬화)은 typecheck·lint만 통과. 개발용 에뮬레이터가 사용 중이라 functions 테스트는 에뮬레이터가 비면 실행한다
- Phase 3 완료
- 검증: `npm run typecheck`, `npm run lint` 통과(경고 54개는 기존 파일). 에뮬레이터 앱 화면 확인은 소셜 로그인이 필요해 하지 못했다(기기 확인 목록에 남김)
- 결정(Phase 3 코드 리뷰): 권장 조치를 받는 동안 [정지하기] 비활성화, 영구 정지는 90일이 지나도 '만료'로 표시하지 않음, 조치 후 권장 조치 캐시 무효화, 숨긴 답글은 비활성 [숨김 해제] 행으로 상태 표시를 반영했다. 경고 범위 캐시 무효화 축소·클라이언트 숨김(`hidden=true`) 경로 정리·Alert 취소 시 선택 유지는 관리자 전용 화면의 소규모 개선이라 반영하지 않았다
- Phase 4 완료
- 검증: `npm run typecheck`, `npm run lint` 통과(새 파일 경고 없음). `acknowledgedAt` 보안 규칙 확인은 에뮬레이터가 비면 실행한다
- 결정(Phase 4 코드 리뷰): 정지 가드가 화면 상태 변화마다 정지 화면으로 되돌리도록 바꿨다(푸시·딥링크로 연 화면, 로그인 직후 이동 차단). 경고 알림은 내비게이터 준비 후 다시 시도하고, 경고 화면은 조치를 읽지 못하면 닫는다. 확인 시각은 확인하지 않은 경고에만 한 번 쓸 수 있게 규칙을 좁혔다. 정지가 앱 실행 중 끝나는 경우는 spec대로 다음 진입부터 반영하고, 로그아웃 분기 중복은 기존 패턴이라 그대로 둔다
- Phase 5 완료
- 검증: 앱·functions typecheck, lint 통과. 이의 신청 functions 테스트(`__tests__/sanction/appeal.integration.test.ts`)는 에뮬레이터가 비면 실행한다
- 결정(Phase 5 코드 리뷰): 이의 신청 mutation은 재시도하지 않고(한 번만 접수되는 요청), 실패해도 내 조치 목록을 새로 받는다. 관리자 푸시의 `admin/appeal` 딥링크는 같은 PR의 Phase 6에서 라우트를 붙인다. 정지가 둘 이상일 때 이전 정지에 정지 화면에서 이의를 신청하는 경로, 조회 실패 시 빈 목록 표시는 드문 경우라 그대로 둔다. 이의 신청 화면의 키보드 오프셋은 앱 전역 `KeyboardToolbar`가 이 화면에도 뜨므로 툴바 높이를 유지한다
- Phase 6 완료
- 검증: 앱·functions typecheck, `npm run lint` 통과(경고 53개는 기존 파일). 이의 신청 결정·조치 취소 functions 테스트는 에뮬레이터가 비면 실행한다
- 결정(Phase 6 코드 리뷰): 조치 취소는 정지 재계산·대상 공개를 먼저 하고 상태를 마지막에 바꿔, 중간에 실패해도 다시 시도할 수 있게 했다. 이의 신청 검토 중인 조치는 신고 상세의 [숨김 해제]로 취소할 수 없고, 경고 조회가 끝나기 전에는 [숨김 해제]를 누를 수 없다. 조치 취소 후 검토 목록·유저 캐시도 갱신하고, 쓰이지 않게 된 `SuspensionBadge` 컴포넌트를 지웠다. 같은 대상을 숨긴 조치가 둘일 때의 공개, 조치 문서 없는 예전 정지, 한 유저의 여러 이의 신청 표시, 검토 목록 페이지 처리는 현재 규모에서 드문 경우라 그대로 둔다

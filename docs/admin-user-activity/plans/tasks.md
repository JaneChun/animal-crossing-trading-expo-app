# 어드민 유저 상세: 신고·리뷰·차단 내역과 정지 상태

> 이슈: 없음
> 작업 종류: 기능 수정
> 상태: 완료
> 생성일: 2026-11-14
> 참조: [docs/admin/plans/tasks.md](../../admin/plans/tasks.md)

## 개요

지금 유저 상세(`AdminUserDetail`)는 신고·리뷰·차단을 숫자로만 보여 준다. 그래서 "받은 신고 12건"을 봐도 누가 무슨 이유로 신고했는지 확인하려면 신고 관리 목록을 뒤지거나 Firestore 콘솔을 열어야 한다. 계정 정지 정보도 화면 맨 아래 신고·차단 영역의 정지 해제 패널로만 드러나 눈에 잘 띄지 않는다.

이번 작업은 유저 상세의 각 통계 아래에 "프로필 보기 >"와 같은 모양의 링크(`ViewAllLink`)를 붙여 내역 화면으로 들어가게 하고, 정지 해제 패널을 계정 섹션 바로 아래로 옮긴다.

- 포함: 받은 신고·보낸 신고 목록, 받은 리뷰·보낸 리뷰 목록, 차단한 유저·차단당한 유저 목록, 정지 패널 위치 이동, 관리자 읽기 권한(차단 서브컬렉션), 복합 인덱스
- 제외: 정지 이력(지금 데이터에 남지 않는다), 차단 해제·리뷰 삭제 같은 관리자 조치, 목록 검색·필터

## 디자인 시안

- 시안: https://claude.ai/artifact/XtbYyZyA3YJg68YfbJYnUk 의 세 번째 줄 "유저 상세 개선" 보드 4개(`AdminUserDetail2`, `AdminUserReports`, `AdminUserReviews`, `AdminUserBlocks`). 기존 최종안 보드는 그대로 두었다.
- 결정: 정지 중이면 정지 해제 패널을 신고 섹션이 아니라 계정 섹션 바로 아래에 둔다(사용자가 시안에서 직접 수정).
- 결정: 신고·차단 섹션을 "신고"(받은 신고·보낸 신고)와 "차단"(차단함·차단당함) 두 섹션으로 나누고, 각 섹션 아래에 내역 링크를 둔다. "접수한 신고"는 탭 이름에 맞춰 "보낸 신고"로 바꾼다(시안대로).
- 결정: 차단 내역 행은 `AdminUsers` 행처럼 이름 옆에 정지 배지, 오른쪽 위에 시각을 둔다(시안대로).
- 결정: 정상 계정에는 별도 표시를 두지 않는다. 정지 중일 때만 정지 해제 패널을 보여 준다(사용자 지시).
- 결정: 빈 목록 문구는 `spec.md` 초안대로 쓴다(사용자 지시).

## Phase 1: 보안 규칙·인덱스

- [x] 관리자가 다른 유저의 차단 서브컬렉션을 읽을 수 있게 규칙 추가 (`firestore.rules`)
  - 대상: `Users/{userId}/BlockedUsers/{id}`, `Users/{userId}/BlockedBy/{id}`의 `allow read`에 `|| isAdmin()` 추가. 쓰기 조건은 그대로 둔다.
  - 패턴: `Reports`의 `allow read: if ... || isAdmin()`와 같은 형태다. `isAdmin()`은 이미 정의돼 있다.
  - 참고: `Reports`는 관리자 읽기가 이미 허용되고, `Reviews`는 로그인 유저 전체 읽기라 규칙 변경이 필요 없다.
- [x] 복합 인덱스 4개 추가 (`firestore.indexes.json`)
  - `Reports`: `reporteeId ASC + createdAt DESC`, `reporterId ASC + createdAt DESC`
  - `Reviews`: `receiverId ASC + createdAt DESC`, `senderId ASC + createdAt DESC`
  - 참고: 기존 `Reports` 인덱스 `reporteeId ASC + createdAt ASC`는 함수의 최근 신고 수 집계용이라 내림차순 정렬에 쓸 수 없다. 차단 서브컬렉션의 `blockedAt` 정렬은 단일 필드라 자동 인덱스로 된다.
- 검증: 에뮬레이터에서 관리자 계정으로 다른 유저의 `BlockedBy` 읽기 성공, 일반 계정으로 읽기 거부

## Phase 2: 조회 서비스·훅

- [x] 유저별 신고 조회 `fetchUserReports({ uid, direction, lastDoc })` (`src/firebase/services/adminService.ts`)
  - `direction`: `'received'`면 `reporteeId == uid`, `'sent'`면 `reporterId == uid`. 둘 다 `createdAt desc`.
  - 재사용: 같은 파일의 `fetchPage`(20개 페이지네이션), `firestoreRequest(..., { throwOnError: true })`
- [x] 유저별 리뷰 조회 `fetchUserReviews({ uid, direction, lastDoc })` (`src/firebase/services/adminService.ts`, `src/types/review.ts`)
  - `Review` 타입에 `id`가 없어 목록 key로 쓸 수 없다. 조회 결과 타입은 `Review & { id: string }`으로 둔다.
- [x] 유저별 차단 조회 `fetchUserBlocks({ uid, direction, lastDoc })` (`src/firebase/services/adminService.ts`, `src/types/admin.ts`)
  - `direction`: `'blocking'`이면 `Users/{uid}/BlockedUsers`, `'blockedBy'`면 `Users/{uid}/BlockedBy`. `blockedAt desc`.
  - 상대 uid는 문서 id다. `BlockedUsers` 문서에는 `blockedAt`만 있고 `id` 필드가 없으므로, 반드시 문서 id(`fetchPage`가 붙이는 `id`)를 쓴다.
  - 새 타입: `AdminBlockRecord = { id: string; blockedAt: Timestamp }`
- [x] 무한 조회 훅 3개 (`src/hooks/admin/query/useUserReports.ts`, `useUserReviews.ts`, `useUserBlocks.ts`)
  - 패턴: `useAdminReports`와 같다(`useInfiniteQuery`, `initialPageParam: null`, `select`로 `pages.flatMap`).
  - 쿼리 키: `['adminUserReports', uid, direction]` 형태로 유저·방향별로 나눈다.
- 검증: `npm run typecheck`

## Phase 3: 내역 화면

- [x] 상대 유저 행 컴포넌트 `UserIdRow` (`src/components/Admin/UserIdRow.tsx`)
  - uid만 받아 `useCachedPublicUserInfo`로 유저 정보를 가져와 `UserRow`(`isListItem`)로 그린다. `right` 슬롯은 그대로 넘긴다.
  - 재사용: `src/components/Admin/UserRow.tsx`, `src/hooks/shared/useCachedPublicUserInfo.ts`
  - 탈퇴 유저: `getPublicUserInfo`가 기본 유저 정보를 돌려주므로 그대로 그리고, 이동은 막는다(`DEFAULT_USER_DISPLAY_NAME` 비교, `BlockedUserUnit`과 같은 방식).
  - 결정: 행을 누르면 상대 유저의 어드민 유저 상세로 간다(사용자 지시).
- [x] 리뷰 행 `ReviewListItem` (`src/components/Admin/ReviewListItem.tsx`)
  - `UserIdRow`의 `right`에 만족·불만족 얼굴 아이콘과 `elapsedTime(createdAt)`을 둔다.
  - 재사용: 유저 상세 거래 리뷰 섹션의 FontAwesome6 `smile-beam`(`icon.green`)·`frown-open`(`icon.red`)
  - 결정: 섬 이름 아래에 리뷰가 달린 게시글 제목을 한 줄로 보여 준다(사용자 지시).
  - 결정: `UserRow`에 섬 이름 아래 줄을 그리는 `subtitle` 슬롯을 추가했다. 기존 행에는 자리가 없었다(시안 기준). 제목은 `usePostDetail('Boards', postId, { includeHidden: true })`(`src/hooks/post/query/usePostDetail.ts`)로 가져온다. 리뷰는 거래글(`Boards`)에서만 생긴다.
- [x] 내역 화면 `AdminUserRecords` (`src/screens/admin/AdminUserRecords.tsx`)
  - 라우트 파라미터: `{ uid: string; kind: 'reports' | 'reviews' | 'blocks' }`. `kind`마다 탭 두 개를 그린다.
  - 신고: 받은 신고 / 보낸 신고 → `ReportListItem`(누르면 신고 상세)
  - 결정: 처리 완료 신고에는 유형 배지·대상 칩 옆에 "처리완료" neutral 배지를 붙인다(사용자 지시). `ReportListItem`에 표시 여부 prop을 추가하고, 기존 신고 관리 목록에서는 끈다.
  - 리뷰: 받은 리뷰 / 보낸 리뷰 → `ReviewListItem`
  - 차단: 차단한 유저 / 차단당한 유저 → `UserIdRow` + 오른쪽에 `elapsedTime(blockedAt)`
  - 재사용: `AdminReports`의 material top tab `screenOptions`, `InfiniteList`, `AdminGuard`
- [x] 라우트·이동 헬퍼 등록 (`src/types/navigation.d.ts`, `src/navigation/RootStackNavigator.tsx`, `src/utilities/navigationHelpers.ts`)
  - 헤더 제목: `kind`별로 "신고 내역" / "리뷰 내역" / "차단 내역"
  - 패턴: 다른 어드민 화면처럼 `commonOptions`로 등록하고 `navigateToAdminUserRecords` 헬퍼를 추가한다.
  - 결정: 헤더 제목은 `AdminChatViewer`처럼 화면 안에서 `setOptions`로 정한다. `RootStack`에 파라미터 타입이 없어 `options` 콜백에서 `kind`를 읽을 수 없다.
  - 결정: 내역에서 다른 유저 상세로 갈 때도 기존 `navigateToAdminUserDetail`을 쓴다. React Navigation 7의 `navigate`는 포커스된 화면 이름이 같을 때만 기존 화면을 재사용하므로, 내역 화면에서 부르면 새 화면이 쌓인다(코드 리뷰).
- 검증: 각 탭 렌더링, 빈 목록 문구, 20개 넘는 데이터에서 다음 페이지 로드

## Phase 4: 유저 상세 연결

- [x] 정지 해제 패널을 신고·차단 섹션에서 계정 섹션 바로 아래로 이동 (`src/screens/admin/AdminUserDetail.tsx`)
  - 재사용: 기존 `DangerActionPanel` 블록과 `isSuspended` 조건을 그대로 옮긴다.
- [x] 신고·차단 섹션을 "신고"(받은 신고·보낸 신고, 검토 필요 배지)와 "차단"(차단함·차단당함) 두 섹션으로 분리 (`src/screens/admin/AdminUserDetail.tsx`)
  - 재사용: `StatStrip` 2칸
- [x] 거래 리뷰 섹션에 "리뷰 내역 보기" 링크, 신고·차단에 "신고 내역 보기"·"차단 내역 보기" 링크 추가 (`src/screens/admin/AdminUserDetail.tsx`)
  - 재사용: `ViewAllLink`(활동 섹션의 "프로필 보기"와 같은 모양)
  - 섹션 배치는 디자인 시안 결정을 따른다.
- 검증: 정지 중 유저는 계정 섹션 아래 패널 표시, 정상 유저는 패널 없음 확인. 링크 3개 → 내역 화면 진입 확인

## Phase 5: 문서

- [x] 발견한 함정이 있으면 `agent_docs/firebase-patterns.md`에 기록

## 진행 기록

### 2026-11-14

- Phase 1 완료
- 결정: 규칙 검증은 에뮬레이터 대신 운영 환경 실기기에서 사용자가 직접 한다(사용자 지시). 규칙·인덱스 배포가 먼저 필요하다.
- Phase 2 완료
- 검증: `npm run typecheck` 통과, 변경 파일 eslint 통과
- Phase 3 완료
- 검증: `npm run typecheck` 통과, 변경 파일 eslint 통과. 탭 렌더링·빈 목록·페이지 로드는 기기 확인 항목으로 넘긴다.
- Phase 4 완료
- 검증: `npm run typecheck` 통과, `npm run lint` 오류 0건(경고 52건은 모두 기존 파일)
- Phase 5 완료: 워크트리·에뮬레이터 규칙 경로 함정을 `agent_docs/environment.md`에 기록
- 전체 구현 완료
- 결정: 신고 처리 상태를 바꾸면 유저별 신고 내역(`adminUserReports`)도 다시 불러온다. 내역에 "처리완료" 배지가 바로 반영되지 않았다(코드 리뷰).

## 기기 확인

- [ ] 규칙·인덱스 배포: `npm run deploy:rules:firestore`와 `firebase deploy --only firestore:indexes`를 실행하고, 인덱스 4개가 콘솔에서 "사용 설정됨"이 될 때까지 기다린다
- [ ] 정지 중인 유저 상세: 계정 섹션 바로 아래에 "계정 정지 · 정지 해제" 패널이 보이고, 신고 섹션에는 패널이 없다
- [ ] 정상 유저 상세: 정지 패널이 보이지 않는다
- [ ] 유저 상세 섹션 순서: 활동 → 거래 리뷰 → 신고(받은 신고·보낸 신고) → 차단(차단함·차단당함)이고, 각 섹션 아래에 "리뷰 내역 보기"·"신고 내역 보기"·"차단 내역 보기" 링크가 있다
- [ ] "신고 내역 보기": 헤더가 "신고 내역"이고 "받은 신고" 탭이 먼저 열린다. 처리 완료 신고에는 "처리완료" 배지가 붙고, 행을 누르면 신고 상세로 간다
- [ ] 신고 관리(`AdminReports`) 목록에는 "처리완료" 배지가 보이지 않는다
- [ ] "리뷰 내역 보기": 행마다 상대 유저, 섬 이름 아래 게시글 제목 한 줄, 오른쪽 위 시각과 아래 만족·불만족 얼굴이 보인다
- [ ] "차단 내역 보기": 다른 유저의 "차단한 유저"·"차단당한 유저" 탭이 권한 오류 없이 열리고, 정지 중인 상대에는 "정지" 배지가 붙는다
- [ ] 리뷰·차단 행을 누르면 상대 유저 상세가 새로 쌓이고, 뒤로 가면 원래 내역 화면으로 돌아온다
- [ ] 탈퇴한 상대 유저 행은 "탈퇴한 사용자"로 보이고 눌러도 이동하지 않는다
- [ ] 빈 탭에서 spec의 빈 목록 문구가 보이고, 20개가 넘는 목록은 끝까지 스크롤하면 다음 페이지가 이어서 불러와진다

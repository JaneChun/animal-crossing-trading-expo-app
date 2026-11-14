# 앱 내 관리자(어드민) 기능

> 이슈: 없음
> 작업 종류: 기능 개발
> 상태: 완료
> 생성일: 2026-11-14

## 개요

지금은 운영 화면에서 게시글만 볼 수 있어서, 신고·에러 내역과 사용 현황(예: 게시글보다 채팅이 활발하다는 사실)을 Firestore 콘솔에서 직접 확인해야 한다. 관리자 계정만 들어갈 수 있는 화면을 앱 안에 추가해 운영 대응(신고 확인·처리, 에러 확인)과 사용 현황 파악(일별·유저별 활동 통계)을 앱에서 할 수 있게 한다.

- 포함: 관리자 role, 신고 목록·상세·처리(완료 표시, 정지 해제, 게시글·댓글 숨김), 신고 시점 스냅샷, 신고 발생 시 관리자 푸시, 신고된 채팅방 읽기 전용 열람, 일별 통계, 유저 목록·유저별 통계, 에러 내역, 디자인 시스템 화면, 신고 대화 열람 고지
- 제외: 강제 업데이트(`app_config`) 설정, 신고되지 않은 채팅방 열람, 신고 문서를 신고마다 따로 남기는 변경(재신고는 기존처럼 같은 문서를 덮어쓴다)

## 디자인 시안

- 시안: https://claude.ai/artifact/XtbYyZyA3YJg68YfbJYnUk (Design 캔버스, 비공개). 최종안 보드 12개만 남아 있다.
- 결정: 정지 조치는 해제만 둔다. 연장 버튼은 만들지 않는다(사용자 지시).
- 결정: 신고 목록 탭은 "접수"·"처리완료" 두 개다. 검토 필요 유저는 어드민 홈에서 들어가는 별도 화면(`AdminReviewUsers`)으로 뺀다(사용자 지시).
- 결정: 어드민 홈과 설정 진입 행에는 미처리 개수를 표시하지 않는다(사용자 지시).
- 결정: 신고 상세는 신고 내용 → 신고자 → 피신고자(누적·최근 30일 `StatTile`) → 신고된 댓글·채팅(`SummaryLinkCard`) → 조치(`DangerActionPanel`) 순서이고, 섹션 사이를 8px 구분선으로 나눈다. 신고 당시 댓글 내용은 제목 아래 한 줄로 보여 준다.
- 결정: 채팅 열람 화면은 신고자를 오른쪽(민트 말풍선), 피신고자를 왼쪽에 둔다.
- 결정: 일별 통계는 `StatCard`(게시글 → 댓글 → 답글 → 채팅 메시지, 신규 가입·리뷰)에 전일 대비 증감을 추세 아이콘으로 붙인다. 증가는 `status.danger`, 감소는 `status.info`다(사용자 지시). 전날 통계를 함께 조회한다.
- 결정: 유저 상세 섹션은 여권 카드 → 계정(`InfoRow`: 로그인 방식·이메일·가입일·마지막 로그인·마지막 접속·푸시 수신 여부) → 활동(`StatStrip` 5칸: 게시글·댓글·답글·채팅방·메시지) → 거래 리뷰(받은 리뷰·만족·불만족, 리뷰 얼굴 아이콘) → 신고·차단(받은 신고·접수한 신고·차단당함·차단함, `needsAdminReview` 배지, 정지 해제) 순서다. 목록은 두지 않고 "전체 보기" 링크(`ViewAllLink`)만 둔다.
- 결정: 아이콘은 MaterialIcons 채움형(게시글 `article`, 댓글 `mode-comment`, 답글 `reply`, 채팅방 `forum`, 메시지 `textsms`), 리뷰는 기존 `ReviewMessageUnit`의 FontAwesome6 `smile-beam`·`frown-open`을 쓴다.
- 결정: 정지 칩·조치 패널·위험 문구는 `status.danger` 글자와 새 토큰 `bg.danger`(`#FFEBEA`)를 쓴다. 신고 유형 배지는 기존 `Badge` red tone을 유지한다.
- 결정: "받은 리뷰 전체 보기"·"받은 신고 전체 보기" 링크는 이번에 그리지 않는다. 목록 화면은 시안을 만든 뒤 후속 작업으로 추가한다(사용자 지시).

## Phase 1: 타입·보안 규칙·인덱스

- [x] `UserInfo`에 `role?: 'admin'`, `lastActiveAt?: Timestamp` 추가 (`src/types/user.ts`)
  - 패턴: `role`은 콘솔에서 직접 넣는다. 지정 UI는 만들지 않는다.
- [x] `Report`에 `collectionName?: Collection`, `snapshot?: ReportSnapshot` 추가, `ReportTarget`·`CreateReportRequest`에 `collectionName` 반영 (`src/types/report.ts`)
  - 결정: 스냅샷은 게시글·댓글만 저장한다. 채팅 메시지는 규칙상 삭제할 수 없어서 원본이 남는다(브레인스토밍 합의).
  - 패턴: 댓글 경로가 `{collectionName}/{postId}/Comments/{commentId}`라서 `collectionName` 없이는 스냅샷 조회와 원문 이동이 불가능하다.
- [x] 게시글·댓글에 `hiddenByAdmin?: boolean` 추가 (`src/types/post.ts`, `src/types/comment.ts`)
  - 결정: 게시글은 기존 `status: 'hidden'`을 그대로 쓰고 `hiddenByAdmin: true`를 함께 기록한다. 새 status 값을 만들면 `useInfinitePosts`의 `not-in` 필터와 `usePostDetail`의 조건을 모두 고쳐야 해서 피했다.
  - 패턴: 댓글은 hard delete(`commentService.deleteComment`)라 status 필드가 없다.
- [x] 보안 규칙 수정 (`firestore.rules`)
  - `isAdmin()` 함수: `get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.role == 'admin'`
  - `Users`: 본인 create·update에서 `role` 필드 쓰기 금지(`affectedKeys().hasAny(['role'])`). 관리자는 `report` 필드만 update 허용
  - `Reports`: 관리자 read, `resolved` update 허용 / `Errors`: 관리자 read 허용
  - `Boards`·`Communities`: 관리자는 `status`·`hiddenByAdmin`·`commentCount`만 update 허용 / `Comments`: 관리자는 `hiddenByAdmin`만 update 허용
  - 결정: 통계는 Cloud Functions callable로 계산하므로, 관리자에게 `Messages` 컬렉션 그룹 읽기 권한을 열지 않는다(사용자 지시).
  - `Chats/{chatId}`·`Messages`: 관리자 read는 `Chats` 문서의 `reportedAt`이 있을 때만 허용
  - 패턴: 기존 규칙은 파일 상단의 `isChatParticipant()`처럼 함수로 분리한다.
- [x] 컬렉션 그룹 인덱스 추가 (`firestore.indexes.json`)
  - `Comments`·`Replies`의 `createdAt`·`creatorId`, `Messages`의 `createdAt`·`senderId`에 COLLECTION_GROUP `fieldOverrides`를 추가한다. Admin SDK 쿼리도 인덱스가 필요하다.
  - 패턴: 현재 `indexes`·`fieldOverrides` 모두 비어 있다.
- 검증: `npm run typecheck`, 에뮬레이터에서 일반 유저의 `role` 쓰기 거부·관리자 `Reports` 읽기 허용 확인

## Phase 2: 신고·활동 데이터 수집 (앱)

- [x] 신고 호출부 3곳에 `collectionName` 전달 (`src/screens/PostDetail.tsx:156`, `src/screens/PostDetail.tsx:290`, `src/hooks/shared/useReportUser.ts`)
  - 패턴: `useReportUser.submitReport`가 정의된 필드만 payload에 펼친다. 같은 방식으로 `collectionName`을 추가한다.
  - 답글 신고가 `commentId`에 답글 id를 넣는지 `PostDetail`의 `onReportClick` 경로를 확인한다. 답글이면 스냅샷 조회 경로가 `Replies`다.
  - 결정: 답글 신고는 `commentId`에 답글 id만 넣고 있어 부모 댓글을 찾을 수 없었다. `Report.replyId`를 추가하고, 답글 신고는 `commentId`=부모 댓글, `replyId`=답글로 보낸다(내 판단). 관리자 숨김은 spec대로 댓글만 지원하고 답글은 숨기지 않는다.
- [x] 신고 생성 시 스냅샷 조회·저장 (`src/firebase/services/reportService.ts` → `functions/src/triggers/reportSnapshot.ts`)
  - 결정: 스냅샷은 제목·본문만이 아니라 대상 문서 전체를 복사한다(사용자 지시).
  - 결정: 스냅샷은 앱이 아니라 `onReportWritten` 함수가 기록하고, 규칙으로 신고자의 `snapshot` 쓰기를 막는다. 앱에서 쓰면 신고자가 내용을 조작할 수 있다. 소프트 삭제로 대체하는 안은 수정된 내용을 남기지 못해 채택하지 않았다(사용자 지시).
  - 재사용: `getPost`(`src/firebase/services/postService.ts:67`), 댓글은 `doc(db, collectionName, postId, 'Comments', commentId)` 단건 조회
  - 결정: 재신고는 기존처럼 문서를 덮어쓰고, 스냅샷도 최신 신고 기준으로 덮어쓴다(사용자 지시).
  - 참고: 기존 `else` 분기의 `updateDocToFirestore`가 `await` 없이 호출된다. 이번 범위에서 고치지 않고 리뷰 때 언급만 한다.
  - 결정: 재신고는 병합 갱신이라 이전 신고의 `postId`·`chatId` 등이 남아 관리자 화면이 대상 종류를 잘못 보여 준다. 이번 신고에 없는 대상 필드는 `deleteField()`로 지우고, 스냅샷은 함수가 지운다(내 판단).
- [x] 앱 실행 시 `lastActiveAt` 갱신 (`src/stores/auth/initializer.ts`)
  - 패턴: `onAuthStateChanged` 콜백에서 `fetchedUserInfo`를 확인한 직후 `saveUserInfo`(`authService.updateLastLogin`과 같은 방식)로 쓴다.
  - 결정: 콜드 스타트마다 1회만 갱신한다. 포그라운드 복귀 때는 갱신하지 않는다(쓰기 비용 대비 정렬 정확도 차이가 작음, 내 판단).
- [x] 관리자가 숨긴 댓글을 목록에서 제외 (`src/firebase/services/commentService.ts`, `src/firebase/services/replyService.ts`)
  - 결정: 게시글의 `status: 'hidden'`처럼 일반 유저 목록에서 아예 뺀다(사용자 지시). 숨긴 댓글의 답글도 보이지 않는다.
  - 패턴: `commentService.fetchAndPopulateUsers`에서 `getDocs` 직후 `hiddenByAdmin`인 문서를 거른다. `lastDoc`은 거르기 전 마지막 문서를 유지해야 페이지네이션이 끊기지 않는다.
  - 결정: 쿼리 조건(`!=`)으로 거르지 않는다. Firestore `!=`는 필드가 없는 기존 댓글까지 결과에서 뺀다.
  - 결정: 댓글 조회(`useComments`)는 페이지네이션이 없고, 답글은 `CommentUnit`이 댓글 아래에서만 불러오므로 `replyService`는 고치지 않았다.
- [x] 신고 대화 열람 고지 (`src/components/PostDetail/ReportModal.tsx`, `src/screens/PrivacyPolicy.tsx`)
  - 패턴: `PrivacyPolicy.tsx`는 이미 "게시글·댓글·채팅 작성자 식별" 항목(36행)이 있다. 같은 목록 형식으로 추가한다.
  - 결정: 신고 모달 문구는 "원활한 신고 처리를 위해, 신고한 대화 내용은 운영진이 확인할 수 있습니다."(사용자 선택)
  - 결정: 처리방침 제1조 목록에 "• 신고 접수 시 신고 대상 게시글·댓글·채팅 내용 확인 및 운영정책 위반 조치"를 추가한다(사용자 선택).
- 검증: 에뮬레이터에서 게시글·댓글·채팅 신고 → `Reports` 문서에 `collectionName`·`snapshot` 저장 확인, 재실행 후 `Users.lastActiveAt` 갱신 확인

## Phase 3: Cloud Functions

- [x] 신고 발생 시 관리자 푸시 (`functions/src/notifications/report.ts` 신규, `functions/src/index.ts`)
  - 재사용: `sendPushNotification`(`functions/src/utils/pushNotification.ts`)
  - 패턴: `functions/src/notifications/comments.ts`처럼 `data.url`에 딥링크를 넣는다. 관리자는 `Users`에서 `role == 'admin'`으로 조회해 `pushToken`이 있는 모두에게 보낸다.
  - 결정: `onDocumentWritten('Reports/{reportId}')`로 생성과 재신고(덮어쓰기)를 모두 감지하고, 관리자가 `resolved`만 바꾼 쓰기에는 보내지 않는다. 기존 `updateUserReport`(`onDocumentCreated`)는 그대로 둔다.
  - 결정: 재신고는 `createdAt`을 새로 쓰므로, 쓰기 전후 `createdAt`이 다를 때만 새 신고로 본다. 관리자의 `resolved` 변경은 `createdAt`을 바꾸지 않는다(내 판단).
  - 결정: 제목 "[관리자] 신고 접수", 본문 "{유형 KR} · {대상 종류} · {상세 내용 앞 30자}"(사용자 선택). 재신고도 같은 문구를 쓴다. 상세 내용이 비어 있으면 마지막 구분자와 함께 생략하고, 30자 자르기는 `truncateText`(`functions/src/utils/common.ts`)를 쓴다.
- [x] 채팅 신고 시 `Chats/{chatId}.reportedAt` 기록 (같은 트리거 안)
  - 결정: 규칙에서 "신고된 채팅만 관리자 열람"을 강제하려면 채팅 문서에 표시가 있어야 한다. 앱이 아니라 함수가 쓰므로 유저가 위조할 수 없다.
  - 결정: 채팅 문서가 없으면 만들지 않는다. `visibleTo` 없는 문서가 생기면 참여자 읽기 규칙(`isVisibleChat`)이 실패한다(내 판단).
- [x] 기존 채팅 신고에 `reportedAt` 채우는 1회성 스크립트 (`scripts/` 신규)
  - 패턴: `scripts/` 폴더의 기존 시드 스크립트처럼 Admin SDK로 실행한다. `Reports`에서 `chatId`가 있는 문서를 읽어 해당 `Chats` 문서에 `reportedAt`을 기록한다.
  - 결정: `scripts/backfill-chat-reported-at.js`. 기본은 확인만 하고 `--apply`일 때만 쓴다. `--emulator`로 에뮬레이터 대상 실행. 운영 실행은 Application Default Credentials가 필요해 사용자가 배포 후 직접 실행한다.
- [x] 정지 해제 복구에서 관리자 숨김 제외 (`functions/src/triggers/reports.ts`의 `restoreUserPostsAfterSuspension`)
  - 패턴: 지금은 `status == 'hidden'`인 글을 모두 `active`로 되돌린다. `hiddenByAdmin === true`인 문서는 batch에서 건너뛴다.
- [x] 통계 callable (`functions/src/admin/stats.ts` 신규)
  - 결정: 통계는 앱이 아니라 callable에서 Admin SDK로 계산한다(사용자 지시).
  - `getDailyStats({ date })`: 그 날짜(KST 0시~24시)의 게시글·댓글·답글·채팅 메시지·신규 가입·리뷰 수
  - 결정: 댓글과 답글은 따로 센다. 서로 다른 컬렉션 그룹이라 합쳐도 쿼리 수가 같다(사용자 지시: 성능이 같으면 분리).
  - `getUserStats({ uid })`: 게시글(`Boards`+`Communities`)·댓글·답글·채팅방·채팅 메시지 수, 접수한 신고 수(`Reports`의 `reporterId`), 차단당함·차단함 수(`BlockedBy`·`BlockedUsers` 서브컬렉션)
  - 패턴: 호출자의 `Users.role`을 확인하고 아니면 `permission-denied`. KST 날짜 경계는 `reports.ts`의 `KST_OFFSET_MS` 계산 방식을 따른다. count는 Admin SDK `.count().get()`.
- 검증: `npm --prefix functions run build`, 에뮬레이터에서 신고 생성·재신고 시 관리자 토큰으로 푸시 요청 발생 확인

## Phase 4: 어드민 서비스·훅

- [x] 어드민 서비스 (`src/firebase/services/adminService.ts` 신규)
  - 조회: 신고 목록(`createdAt` 내림차순, `resolved` 필터), `needsAdminReview` 유저 목록, 에러 목록(`timestamp` 내림차순), 유저 목록(`lastActiveAt` 내림차순), 신고된 채팅 메시지 1회 조회
  - 변경: 신고 `resolved` 처리, 정지 해제(`liftSuspension` callable), 게시글 숨김·해제, 댓글 숨김·해제
  - 결정: 정지 해제는 `liftSuspension` callable로 한다. 0시 스케줄러와 같은 `liftUserSuspension`(suspendUntil 비우기 + 게시글 복구)을 호출해 게시글이 즉시 복구된다. 관리자의 `Users.report` 쓰기 규칙은 뺐다(사용자 지시).
  - 결정: 신고 목록 쿼리(`resolved` 동등 + `createdAt` 정렬)용 복합 인덱스를 `firestore.indexes.json`에 추가했다. 에뮬레이터는 인덱스를 검사하지 않으므로 운영 배포 전 `firestore:indexes` 배포가 필요하다.
  - 결정: 신고 상세가 원문 상태(숨김·삭제)를 확인할 수 있도록 `fetchReportTargetContent`를 추가했다. `collectionName`이 없는 기존 신고는 `Boards` → `Communities` 순으로 찾는다(spec 엣지 케이스).
  - 결정: 댓글 숨김·해제 시 게시글 `commentCount`를 댓글 1 + 답글 수만큼 줄이거나 늘린다. 답글 수는 `commentService.deleteComment`와 같은 방식으로 센다(내 판단).
  - 통계는 Firestore가 아니라 `httpsCallable(functions, 'getDailyStats' | 'getUserStats')`로 호출한다. 패턴: `authService.getFirebaseCustomToken`
  - 패턴: 모든 요청을 `firestoreRequest`로 감싼다(`src/firebase/core/firebaseInterceptor.ts:7`).
- [x] 목록 조회 훅 (`src/hooks/admin/query/useAdminReports.ts`, `useAdminErrors.ts`, `useAdminUsers.ts`, `useNeedsReviewUsers.ts`)
  - 재사용: `useInfinitePosts`(`src/hooks/post/query/useInfinitePosts.ts`)의 `lastDoc` 커서 + `useInfiniteQuery` 페이지네이션
- [x] 통계 훅 (`src/hooks/admin/query/useDailyStats.ts`, `useUserStats.ts`)
  - 결정: 쿼리 키는 날짜 단위(`['adminDailyStats', 'YYYY-MM-DD']`)로 나눈다. 지난 날짜는 `staleTime`·`gcTime` 모두 `Infinity`, 오늘은 `staleTime` 1분. 앱 기본 `gcTime`이 10분(`App.tsx`)이라 `gcTime`도 바꿔야 캐시가 남는다. 디스크 영속화는 하지 않는다(사용자 지시).
- [x] 변경 훅 (`src/hooks/admin/mutation/`)
  - 패턴: 기존 `src/hooks/comment/mutation/`처럼 성공 시 관련 쿼리 키를 invalidate한다.
- 검증: `npm run typecheck`, `npm run lint`

## Phase 5: 화면 — 진입·신고·채팅 열람

- [x] 라우트 추가 (`src/types/navigation.d.ts`, `src/navigation/RootStackNavigator.tsx`, `src/utilities/navigationHelpers.ts`)
  - 화면: `AdminHome`, `AdminReviewUsers`, `AdminReports`, `AdminReportDetail`, `AdminChatViewer`, `AdminStats`, `AdminUsers`, `AdminUserDetail`, `AdminErrors`, `DesignSystem`
  - 패턴: `Setting`·`Block`처럼 RootStack에 `commonOptions`로 등록하고 `navigateToXxx` 헬퍼를 추가한다.
- [x] 푸시 딥링크 경로 (`App.tsx`의 `linking.config.screens`)
  - `AdminReportDetail: 'admin/report/:reportId'`
- [x] 진입점: 설정 화면에 관리자 섹션 (`src/screens/Setting.tsx`)
  - 재사용: `SettingListItem`
  - 결정: `userInfo.role === 'admin'`일 때만 섹션을 그린다. 화면 컴포넌트에도 같은 가드를 둔다(딥링크로 직접 들어오는 경우).
  - 결정: 가드는 `AdminGuard` 컴포넌트다. 앱 시작 직후 유저 정보가 `null`인 동안은 로딩만 보여 주고, 일반 유저로 확인되면 뒤로 보낸다. `null`일 때 바로 내보내면 푸시로 콜드 스타트한 관리자도 쫓겨난다(내 판단).
- [x] 어드민 홈·신고 목록·신고 상세 (`src/screens/admin/AdminHome.tsx`, `AdminReports.tsx`, `AdminReportDetail.tsx`, `src/components/Admin/`)
  - 신고 목록 상단 탭: 접수 / 처리완료. 검토 필요 유저(`needsAdminReview`)는 `AdminReviewUsers` 화면으로 분리한다(디자인 시안 결정).
  - 재사용: `EmptyIndicator`, `LoadingIndicator`, `Badge`, `Button`, `Text`(`src/components/ui/`)
- [x] 신고된 채팅 읽기 전용 화면 (`src/screens/admin/AdminChatViewer.tsx`)
  - 재사용 후보: `renderMessage`·`renderDay`(`src/components/Chat/CustomRenderers.tsx`), `src/utilities/formatIMessages.ts`
  - 결정: `useChatRoom`은 실시간 구독과 읽음 처리를 함께 하므로 쓰지 않는다. 메시지는 1회 조회한다.
  - 결정: GiftedChat 렌더러 대신 `FlatList`와 기존 `DateSeparator`로 그렸다. 시스템·리뷰 메시지는 가운데 회색 글자로 보여 준다(내 판단).
- 검증: 에뮬레이터 관리자 계정으로 설정 → 어드민 → 신고 상세 → 원문·채팅 이동, 완료·정지 변경·숨김 동작 확인. 일반 계정에서는 메뉴가 보이지 않음 확인

## Phase 6: 화면 — 통계·유저·에러·디자인 시스템

- [x] 일별 통계 (`src/screens/admin/AdminStats.tsx`)
- [x] 유저 목록·유저 상세 (`src/screens/admin/AdminUsers.tsx`, `AdminUserDetail.tsx`)
  - 재사용: `useCachedPublicUserInfo`, 기존 `Profile` 화면 이동(`navigateToProfile`)
- [x] 에러 목록 (`src/screens/admin/AdminErrors.tsx`)
- [x] 디자인 시스템 (`src/screens/admin/DesignSystem.tsx`)
  - 재사용: `src/theme/`의 `useTheme().colors`, `TextVariants`, `Spacing`, `BorderRadius`, `Shadow`와 `src/components/ui/` 공통 컴포넌트
  - 패턴: 토큰 사용 규칙은 `agent_docs/design-system.md`를 따른다.
- [x] 새 토큰·공통 컴포넌트 (`src/theme/Color.ts`, `src/components/ui/`, `src/components/Admin/`)
  - 토큰: `bg.danger`(라이트 `#FFEBEA`, 다크 값은 구현 때 정한다), `Badge` tone `danger`(`status.danger` + `bg.danger`)
  - 컴포넌트: `ContentTypeChip`, `StatCard`, `StatStrip`, `UserRow`, `InfoRow`, `DangerActionPanel`, `StatTile`, `SummaryLinkCard`, `ViewAllLink`. 모양은 디자인 시안의 DesignSystem 보드를 따른다.
  - 결정: 두 도메인 이상에서 쓰는 것만 `ui/`로 올리고, 어드민 화면에서만 쓰는 것은 `src/components/Admin/`에 둔다(`agent_docs/design-system.md` 기준).
  - 결정: 새 컴포넌트는 모두 어드민에서만 쓰여 `src/components/Admin/`에 두었다. `ui/` 변경은 `Badge` tone `danger` 추가뿐이다.
  - 결정: `Badge`는 tone 키가 `text.{key}`·`bg.{key}` 쌍이어야 해서 `text.danger`(= `status.danger` 값)도 함께 추가했다. `bg.danger` 다크 값은 `Palette.red[900]`(`#3D1A18`)로 정했다(내 판단).
  - 결정: 색 이름 리터럴 가드레일(`valueColor: 'red'`)에 걸려 숫자 색 prop 이름을 `valueTone`으로 정했다.
- 검증: 각 화면 렌더링, 통계 화면을 나갔다 다시 들어왔을 때 지난 날짜 요청이 다시 나가지 않음 확인(네트워크 로그)

## Phase 7: 문서

- [x] 어드민 기능 문서 (`agent_docs/features/admin.md` 신규, `CLAUDE.md` 세부 문서 표는 기존 `features/` 행으로 충분한지 확인)
  - 담을 내용: `role` 지정 방법(콘솔 수동), `hiddenByAdmin`과 정지 복구의 관계, `Chats.reportedAt`이 관리자 열람 권한의 근거라는 점, `lastActiveAt` 갱신 시점

## 진행 기록

### 2026-11-14

- 결정: 사용자 부재 중 진행하므로 Phase별 커밋 확인 없이 끝까지 진행하고, 커밋 단위와 추천 메시지는 완료 보고에 정리한다(사용자 지시).
- 결정: spec과 시안에 없는 어드민 전용 문구(빈 목록·토스트·확인 다이얼로그)는 직접 작성하고 완료 보고에 목록으로 정리한다. 일반 유저에게 보이는 문구는 정해진 것만 쓴다(사용자 지시).
- 결정: 규칙·함수 검증은 원래 폴더에서 실행 중인 에뮬레이터를 종료한 뒤 worktree에서 임시 에뮬레이터(import·export 없음)를 띄워 진행하고, 끝나면 종료한다(사용자 허락).
- Phase 1 완료
- 검증: `npm run typecheck` 통과. 규칙 검증은 Phase 3 함수 검증과 같은 에뮬레이터 실행에서 함께 진행한다
- Phase 2 완료
- 검증: `npm run typecheck` 통과, 변경 파일 eslint 오류 0건(기존 경고만 있음). 신고 문서 저장은 앱 조작이 필요해 기기 확인 목록으로 넘긴다
- Phase 3 완료
- 검증: `npm --prefix functions run build` 통과, functions lint 오류 0건. `npx firebase emulators:exec --only firestore "npm test"` 19개 스위트 203개 테스트 통과(신규: `notifications/report`, `admin/stats` 통합 테스트, 정지 해제 복구에서 관리자 숨김 제외 케이스)
- 검증: worktree 임시 에뮬레이터(auth·firestore·functions)에서 JS SDK 클라이언트로 규칙 21개 케이스 통과(일반 유저 `role` 쓰기 거부, 관리자 `Reports`·`Errors` 읽기, 신고된 채팅만 관리자 열람, 관리자 허용 필드 외 변경 거부 등). 채팅 신고 생성 시 트리거가 `Chats.reportedAt`을 기록함을 확인. `getDailyStats`·`getUserStats`는 관리자 토큰으로 결과 반환, 일반 유저는 `PERMISSION_DENIED`. 백필 스크립트 확인·기록 모드 동작 확인. 실제 Expo 푸시 전송은 외부 요청이라 mock 테스트로만 확인
- Phase 4 완료
- 검증: `npm run typecheck` 통과, 변경 파일 eslint 경고·오류 0건, `npx jest --selectProjects unit` 55개 통과(신규 `kstDate` 4개 포함)
- Phase 5 완료
- Phase 6 완료
- 검증: `npm run typecheck` 통과, `npx eslint src App.tsx` 오류 0건(변경 파일 경고 0건), `npx jest --selectProjects unit` 58개 통과. worktree Metro(8083)에서 앱 전체 번들 성공(2555 modules)
- 검증 못 함: 시뮬레이터 앱이 로그아웃 상태였고 소셜 로그인은 사람이 해야 해서 관리자 화면을 직접 열어 보지 못했다. 화면 확인은 아래 `## 기기 확인`으로 넘긴다
- 결정: spec의 신고 탭·정지 변경·일별 통계·유저 상세 서술을 디자인 시안 결정(위 "디자인 시안" 섹션)에 맞게 고쳤다
- Phase 7 완료
- 결정: `CLAUDE.md` 세부 문서 표의 `agent_docs/features/` 행("기능별 동작 설명")이 새 문서를 포괄하므로 표는 고치지 않았다
- 전체 구현 완료
- 기기 확인 피드백 반영: 정지 해제를 `liftSuspension` callable로 변경, 관리자 목록 빈 화면 세로 가운데 정렬, 신고 관리 탭 배경색, 디자인 시스템 StatStrip 예시의 key 중복
- 결정: 댓글을 숨긴 사이 답글이 달리면 숨김 해제 때 `commentCount`가 1 많아지는 경우는 발생 가능성이 낮아 고려하지 않는다(사용자 지시)
- 결정: 인덱스를 콘솔 대신 `firestore.indexes.json`으로 관리한다. 운영 인덱스 12개를 `firebase firestore:indexes`로 받아 파일에 합쳤다(사용자 지시)
- 커밋 리뷰 피드백 반영: 신고 목록·상세에 대상 종류 칩을 유형 뱃지 옆에 표시, 관리자는 숨김·삭제된 게시글을 상세로 열람하고 상태 배너 표시, 일괄 등록의 `SectionBanner`를 공통 `ui/Banner`로 이동
- 검증(스냅샷 함수 이동): functions build 통과, `triggers/reportSnapshot`·`notifications/report` 테스트 15개 통과, 임시 에뮬레이터에서 신고자 `snapshot` 쓰기·삭제 거부 등 규칙 5건 통과
- 검증: functions build 통과, `functions npm test -- triggers/reports admin` 18개 통과, 앱 typecheck·admin lint 통과, 앱 unit 58개 통과. 보안 규칙 검증 스크립트는 사용자 에뮬레이터 데이터를 오염시키므로 재실행하지 않음

## 기기 확인

에뮬레이터 모드에서 본인 계정 `Users` 문서에 `role: 'admin'`을 넣고 앱을 다시 실행한 뒤 확인한다.

- [ ] 설정 화면 맨 아래에 "관리자" 섹션과 "관리자 페이지" 행이 보이고, 누르면 어드민 홈(운영·사용 현황·개발 3개 섹션)이 열린다
- [ ] 일반 계정의 설정 화면에는 관리자 섹션이 보이지 않는다
- [ ] 게시글·댓글·답글·채팅·프로필을 신고하면 신고 모달 상세 입력칸 아래에 열람 고지 문구가 보이고, Emulator UI의 `Reports` 문서에 `collectionName`·`snapshot`(채팅·프로필은 없음)이 저장된다
- [ ] 같은 유저를 게시글로 신고한 뒤 채팅으로 다시 신고하면 `Reports` 문서에서 `postId`·`snapshot`이 지워지고 `chatId`만 남는다
- [ ] 신고 관리: "접수"·"처리완료" 탭이 나뉘고, 항목에 유형 배지·시각·상세 내용·대상 칩·신고자 → 피신고자가 보인다
- [ ] 신고 상세(게시글·댓글): 신고 당시 내용과 원문 카드가 보이고, 카드를 누르면 게시글 상세로 이동한다. 숨기기 → 확인 후 일반 계정 목록·상세에서 사라지고, "숨김 해제"로 돌아온다
- [ ] 댓글 숨기기 후 일반 계정의 게시글 상세에서 그 댓글과 답글이 보이지 않고, 게시글 댓글 수가 댓글 1 + 답글 수만큼 줄어든다
- [ ] 신고 상세(채팅): 참여자 카드를 누르면 채팅 열람 화면이 열리고, 신고자 메시지가 오른쪽 민트, 피신고자 메시지가 왼쪽에 보인다. 열람 후 상대 계정의 안 읽은 수가 바뀌지 않는다
- [ ] 정지 중인 피신고자의 "정지 해제" → 확인 후 조치 행이 사라지고, 정지 때 숨겨진 글이 바로 다시 보인다(관리자가 숨긴 글은 계속 숨김)
- [ ] "처리 완료"를 누르면 "처리완료" 탭으로 옮겨 가고, "미처리로 되돌리기"로 돌아온다. 이때 관리자 푸시가 오지 않는다
- [ ] 다른 계정으로 신고하면 관리자 기기에 "[관리자] 신고 접수" 푸시가 오고, 누르면 해당 신고 상세가 열린다(앱 종료 상태 포함)
- [ ] 검토 필요 유저: `needsAdminReview` 유저가 "MM.DD까지 정지" 칩과 함께 보이고, 누르면 유저 상세로 이동한다
- [ ] 일별 통계: 이전·다음 날짜 이동, 오늘에서는 다음 버튼 비활성, 전날 대비 증가는 빨강·감소는 파랑 추세가 보인다. 지난 날짜를 다시 방문해도 `getDailyStats` 요청이 다시 나가지 않는다(Reactotron)
- [ ] 유저 목록이 최근 접속순이고, 정지·관리자 배지가 보인다. 유저 상세의 계정·활동·거래 리뷰·신고·차단 숫자가 Emulator UI 데이터와 맞는다
- [ ] 에러 내역: 항목을 누르면 stack이 펼쳐지고 다시 누르면 접힌다
- [ ] 디자인 시스템 화면이 라이트·다크 모드에서 모두 깨지지 않는다(`xcrun simctl ui booted appearance dark`). 정지 칩·조치 패널의 다크 색(`bg.danger`)이 읽을 만하다
- [ ] 개인정보 처리방침 제1조 목록에 신고 관련 항목이 보인다
- [ ] 정지 중인 유저의 게시글을 숨긴 뒤 "숨김 해제" → 게시글은 계속 보이지 않고, 정지 해제 후 다시 보인다
- [ ] 신고 상세 맨 위에 신고 유형 뱃지 옆으로 대상 종류 칩(게시글·댓글·답글·채팅·프로필)이 보인다
- [ ] 숨김·삭제된 게시글을 신고한 상세에서 원문 링크와 상태 안내가 보이고, 링크를 누르면 게시글 상세가 열린다(일반 유저는 계속 "게시글을 찾을 수 없습니다")
- [ ] 관리자가 숨김·삭제된 게시글 상세를 열면 맨 위에 상태 배너(작성자가 삭제한 게시글 / 관리자가 숨긴 게시글 / 계정 정지로 숨겨진 게시글)가 보인다
- [ ] 신고 관리 목록에서 신고 유형 뱃지 바로 옆에 대상 종류 칩이 보인다
- [ ] 게시글 일괄 등록 결과 화면의 배너 3종(찾음·재확인·실패)이 이전과 같은 색·간격으로 보인다

# 관리자(어드민)

설정 화면 → "관리자" 섹션에서 들어가는 운영 화면(신고·검토 필요 유저·에러·일별 통계·유저·디자인 시스템). 코드: `src/screens/admin/`, `src/components/Admin/`, `src/hooks/admin/`, `src/firebase/services/adminService.ts`, `functions/src/admin/stats.ts`, `functions/src/notifications/report.ts`.

## 관리자 지정

- `Users/{uid}.role = 'admin'`을 **Firestore 콘솔에서 직접** 넣는다. 앱에는 지정 UI가 없다.
- 보안 규칙이 본인의 `role` 쓰기(생성·수정)를 막는다. 규칙의 `isAdmin()`은 요청자의 `Users` 문서를 `get()`으로 읽어 판단한다.
- 앱은 `onAuthStateChanged`에서 받은 `userInfo.role`로 메뉴를 그린다. 콘솔에서 바꾼 뒤에는 앱을 다시 실행해야 메뉴가 보인다.
- 화면마다 `AdminGuard`가 role을 다시 확인한다. 딥링크로 들어온 일반 유저는 뒤로 보낸다. 앱 시작 직후 유저 정보를 복원하기 전(`null`)에는 로딩만 보여 준다.

## 숨김과 정지 복구의 관계

- 관리자 게시글 숨김은 `status: 'hidden'` + `hiddenByAdmin: true`다. 정지로 숨긴 글은 `hiddenByAdmin`이 없다.
- 정지 해제 복구(`restoreUserPostsAfterSuspension`)는 `hiddenByAdmin === true`인 글을 건너뛴다. 이 필드 없이 숨기면 정지가 풀릴 때 다시 보인다.
- 관리자 게시글 숨김 해제는 작성자가 정지 중이면 `hiddenByAdmin`만 지우고 `status: 'hidden'`을 유지한다. 그래야 정지 기간에 글이 노출되지 않고, 정지가 풀릴 때 복구 대상이 되어 다시 보인다(`adminService.setPostHidden`).
- 관리자 댓글 숨김은 `hiddenByAdmin: true`이고, 일반 유저 목록에서는 `commentService.fetchAndPopulateUsers`가 조회 직후 거른다. Firestore `!=` 조건은 필드가 없는 기존 댓글까지 빼므로 쓰지 않는다. 숨길 때 게시글 `commentCount`를 댓글 1 + 답글 수만큼 함께 줄인다.
- **정지 해제는 `liftUserSuspension`(`functions/src/triggers/reports.ts`)으로만 한다.** `suspendUntil`을 `null`로 비우고 게시글 복구까지 함께 한다. 0시 스케줄러(`restoreSuspendedUserPostsScheduler`)는 `suspendUntil <= now`인 유저만 찾으므로, 복구 없이 `null`만 쓰면 정지 때 숨겨진 게시글이 영영 복구되지 않는다.
- 관리자 정지 해제는 `liftSuspension` callable이 이 함수를 호출해 즉시 처리한다. 관리자에게는 `Users.report` 쓰기 권한이 없다.

## 신고된 채팅 열람 권한 (`Chats.reportedAt`)

- 관리자는 `Chats` 문서에 `reportedAt`이 있는 채팅방만 읽을 수 있다(규칙: 채팅방 문서는 `isReportedChatResourceForAdmin`, 메시지는 `isReportedChatForAdmin`). 신고되지 않은 대화는 열람할 수 없다.
- `reportedAt`은 `onReportWritten` 함수가 채팅 신고 생성·재신고 때 기록한다. 앱이 쓰지 않으므로 유저가 위조할 수 없다. 채팅 문서가 없으면 만들지 않는다(`visibleTo` 없는 문서가 생기면 참여자 읽기 규칙이 실패한다).
- 함수 배포 이전의 채팅 신고에는 값이 없다. 배포 직후 `node scripts/backfill-chat-reported-at.js --apply`를 한 번 실행한다(기본은 확인만, `--emulator`로 에뮬레이터 대상).
- 열람 화면은 메시지를 1회 조회만 한다. `useChatRoom`을 쓰면 읽음 처리가 일어나 참여자의 `unreadCount`·`isReadBy`가 바뀐다.

## 신고 알림

- `onReportWritten`(`onDocumentWritten('Reports/{id}')`)이 `role == 'admin'`이고 `pushToken`이 있는 모든 유저에게 푸시를 보낸다. 딥링크는 `admin/report/:reportId`.
- 재신고는 문서를 덮어쓰며 `createdAt`을 새로 쓰므로, 쓰기 전후 `createdAt`이 다를 때만 새 신고로 본다. 관리자의 `resolved` 변경에는 보내지 않는다.

## 신고 데이터

- 게시글·댓글·답글 신고는 `collectionName`을 함께 저장한다. 답글 신고는 `commentId`가 부모 댓글, `replyId`가 답글이다.
- 신고 시점 `snapshot`(신고 대상 게시글·댓글·답글 문서 전체를 복사한 값)은 **`onReportWritten` 함수가 기록한다**(`functions/src/triggers/reportSnapshot.ts`). 앱(신고자)이 쓰면 내용을 조작할 수 있어서, 규칙이 신고자의 `snapshot` 쓰기를 막는다. 함수가 실행되기 전 1~2초 동안은 스냅샷이 비어 있다.
- 함수는 `collectionName`이 `Boards`·`Communities`일 때만 원문을 읽는다. 신고자가 이 값을 임의로 쓸 수 있으므로, 제한하지 않으면 신고 문서를 통해 다른 컬렉션 문서의 `title`·`body`를 읽어 갈 수 있다.
- 재신고는 병합 갱신이라 이번 신고에 없는 대상 필드를 `deleteField()`로 지운다. 이전 스냅샷은 함수가 새 대상 기준으로 덮어쓰거나 지운다. 지우지 않으면 이전 대상의 `postId`·`chatId`가 남아 관리자 화면이 대상 종류를 잘못 보여 준다.

## 활동 시각 (`lastActiveAt`)

- 로그인 상태로 앱을 실행할 때(자동 로그인 포함) `onAuthStateChanged`에서 1회 갱신한다. 포그라운드 복귀 때는 갱신하지 않는다.
- 유저 목록은 `orderBy('lastActiveAt')`이라 이 필드가 없는 유저(배포 후 앱을 열지 않은 유저)는 목록에 나오지 않는다.

## 통계

- `getDailyStats({ date })`·`getUserStats({ uid })` callable이 Admin SDK `count()`로 계산한다. 관리자에게 `Messages` 컬렉션 그룹 읽기 권한을 열지 않기 위해서다. 날짜 경계는 KST 고정 오프셋(+9h)이다.
- 컬렉션 그룹 쿼리(`Comments`·`Replies`의 `createdAt`·`creatorId`, `Messages`의 `createdAt`·`senderId`)와 신고 목록(`resolved` + `createdAt`)은 `firestore.indexes.json`의 인덱스가 필요하다. 에뮬레이터는 인덱스를 검사하지 않으므로 운영 배포 때 `firebase deploy --only firestore:indexes`를 빠뜨리면 운영에서만 실패한다.
- 일별 통계는 날짜별 쿼리 키로 캐시한다. 지난 날짜는 `staleTime`·`gcTime` 모두 `Infinity`이고, 오늘은 `staleTime` 1분이다. 앱 기본 `gcTime`(10분)을 덮으려면 지난 날짜에만 `gcTime`을 넘긴다(`undefined`를 넘기면 앱 기본값이 아니라 라이브러리 기본값이 된다).

## 숨김·삭제된 게시글 열람

- 관리자는 게시글 상세(`usePost`)에서 숨김·삭제된 게시글도 본다. 이때 헤더 맨 위에 상태 배너(`getAdminOnlyBanner`)가 붙는다. 일반 유저에게는 이런 글이 조회되지 않으므로 배너에 관리자 검사가 따로 없다.
- 열람은 `usePostDetail`의 `includeHidden` 옵션으로, 거르는 처리는 `queryFn`이 아니라 `select`에서 한다.
- 쿼리 키를 나누지 않는 이유: 댓글 작성·삭제 등이 `['postDetail', collectionName, id]`에 `setQueryData`로 댓글 수를 바로 반영하는데, 키를 나누면 관리자 계정의 캐시에는 반영되지 않는다.

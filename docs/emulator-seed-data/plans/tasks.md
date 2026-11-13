# 에뮬레이터 테스트 데이터 seed 정비

> 이슈: 없음
> 작업 종류: 기능 수정
> 상태: 완료
> 생성일: 2026-11-13

## 개요

에뮬레이터에 데이터를 넣는 스크립트가 두 개로 나뉘어 있고, 둘 다 실행 명령이 정리되어 있지 않다. `scripts/seed-test-data.js`는 카탈로그(`CatalogItems`)만 넣는데, gitignore 대상이라 이 컴퓨터에만 있고 variants 문서 ID가 운영 import(`functions/scripts/import-catalog.ts`)와 다르다. `src/__tests__/firebase-utils/seed-test-data.js`는 git으로 추적되며 유저·게시글·채팅·댓글을 넣지만, 연결된 npm 스크립트가 없고 데이터가 현재 타입(`src/types/`)과 맞지 않는다.

목표는 `npm run emulator:seed` 하나로 카탈로그와 테스트 데이터를 현재 스키마에 맞게 넣고, `npm run dev:emulator:all`을 종료할 때 그 결과가 `emulator-data/`에 export되어 다음 실행부터 바로 쓰이게 하는 것이다.

- 포함: 테스트 데이터 최신화, 카탈로그 seed 통합, 재실행 안전성, npm 스크립트·문서 정리
- 제외: Maestro E2E flow 수정(`test-helpers.js`, `cleanup-test-data.js`는 건드리지 않음), 운영 DB 데이터 변경

## Phase 1: 테스트 데이터를 현재 스키마에 맞추기

검증: `npm run emulator:start` 후 `node src/__tests__/firebase-utils/seed-test-data.js`가 오류 없이 끝나고, Emulator UI(http://localhost:4000)에서 각 문서 필드가 `src/types/`의 타입과 일치한다.

- [x] 유저 데이터 정리 (`src/__tests__/firebase-utils/seed-test-data.js` — `testUsers`)
  - 패턴: `UserInfo`(`src/types/user.ts`) 기준. `fruit`, `titleFirst`, `titleLast`, `bio`는 선택 필드라 1~2명에만 넣어 표시 차이를 확인할 수 있게 한다.
  - 현재 문제: `photoURL`이 `via.placeholder.com`을 가리킨다.
  - 결정: `photoURL`은 데이터에 직접 적지 않고, Phase 3 이미지 업로드 단계가 `seed-images/users/`의 파일을 올린 뒤 받은 URL을 넣는다(사용자 지시).
  - 결정: 1번 유저(`001827.95fe….0427`)의 uid는 환경 변수 `SEED_MY_UID`가 있으면 그 값으로 바꾼다. 값은 사용자가 `.env.local`에 둔다. `EXPO_PUBLIC_` 접두사를 붙이지 않아 앱 번들에 포함되지 않게 한다. 이 uid를 참조하는 게시글·채팅·댓글·리뷰·알림 전부에 같은 값이 들어가도록 uid를 상수 하나로 모아 쓴다(사용자 지시).
- [x] 마켓 게시글(`Boards`) 정리 (`seed-test-data.js` — `testBoards`)
  - 패턴: `MarketPost`(`src/types/post.ts`) — `cart: CartItem[]` 필수, `status` 필수, `type`은 `buy | sell | done`.
  - 현재 문제: 모든 게시글에 `cart`가 없고, `board1`에 `status`가 없다. `commentCount`가 실제로 넣는 댓글 수와 다르다.
  - 재사용: `cart` 항목은 `src/utilities/catalogItemToItem.ts`가 만드는 `Item` 형태(`id`, `category`, `color`, `imageUrl`, `name`)에 `quantity`, `price`, `unit`을 붙인다. 아이템 값은 `catalog.json`의 실제 아이템에서 가져온다.
- [x] 커뮤니티 게시글(`Communities`) 정리 (`seed-test-data.js` — `testCommunities`)
  - 패턴: `CommunityPost` — `images`, `villagers` 필수. `chatRoomIds`, `reviewPromptSent`는 마켓 전용이라 제거한다. `type`은 `src/constants/post.ts`의 `COMMUNITY_TYPES` 값만 쓴다.
  - 현재 문제: `villagers`가 없고, 이미지가 `via.placeholder.com`이다.
  - 결정: `villagers`에는 운영 `Villagers` 문서 ID(= Algolia `objectID`)를 직접 적는다. 이미지 없는 분양 글에 주민을 넣어 섬네일이 주민 이미지로 대체되는 경우(`CommunityThumbnail`)도 확인할 수 있게 한다(사용자 지시).
  - 결정: `images`는 데이터에 직접 적지 않고, Phase 3 이미지 업로드 단계가 `seed-images/communities/`의 파일을 올린 뒤 받은 URL을 넣는다. 게시글마다 0~4장으로 개수를 다르게 해 이미지 없는 경우와 여러 장인 경우를 모두 확인할 수 있게 한다(사용자 지시).
- [x] 채팅방·메시지 정리 (`seed-test-data.js` — `testChats`, `testMessages`)
  - 재사용: 채팅방 ID는 `src/firebase/services/chatService.ts:33`의 `generateChatId`와 같은 규칙(두 uid를 정렬해 `_`로 연결)을 따른다.
  - 현재 문제: `unreadCount`의 키 `'00182795fec4cf29524bfbb08744e92ef6050a0427'`가 실제 uid(점 포함)와 달라 안 읽은 수가 표시되지 않는다. 각 채팅방의 `lastMessage`가 마지막 메시지와 일치하는지도 맞춘다.
- [x] 댓글·대댓글 정리 (`seed-test-data.js` — `testComments`, `testReplies`)
  - 패턴: `Comment`, `Reply`(`src/types/comment.ts`, `reply.ts`). 경로는 `{Boards|Communities}/{postId}/Comments/{commentId}/Replies`(`src/firebase/services/commentService.ts:76`, `:161`).
  - 게시글의 `commentCount`를 실제 댓글 수에 맞춘다(대댓글 포함 여부는 `commentService.ts`의 증가 로직을 확인해 따른다).
- [x] Reviews·Notifications 시드 추가 (`seed-test-data.js`)
  - 패턴: `Review`(`src/types/review.ts`), `Notification`(`src/types/notification.ts`). 둘 다 최상위 컬렉션이다(`src/firebase/services/commentService.ts:104`).
  - 리뷰는 거래완료(`done`) 게시글과 그 채팅방을 참조하고, 받은 유저의 `review` 집계(`positive`, `negative`, `total`)와 개수가 맞아야 한다. 알림은 실제로 시드된 댓글·대댓글에 대응하게 만들고, 읽음·안 읽음을 섞는다.
  - 결정: 추가한다(사용자 지시).

## Phase 2: 카탈로그·주민 seed를 운영 구조로 통합

검증: 카탈로그·주민만 시드한 뒤 Emulator UI에서 variants 문서 ID가 `"0_0"` 형식이고, `Villagers` 문서 ID가 Algolia `objectID`와 같다.

- [x] 카탈로그 seed 모듈 작성 (`src/__tests__/firebase-utils/seed-catalog.js` 신규)
  - 재사용: 문서 구조는 `functions/scripts/import-catalog.ts`의 `docData`·`variantData` 필드 선택을 그대로 따른다(부모 6개 필드, variant 문서 ID는 `variantId`).
  - 재사용: Admin 초기화는 `src/__tests__/firebase-utils/firebase-admin-setup.js`의 `db`를 쓴다.
  - 패턴: 500개 단위 배치 커밋(`import-catalog.ts`와 동일).
- [x] `catalog.json`이 없을 때 처리 (`seed-catalog.js`)
  - 원본 `functions/scripts/output/catalog.json`은 gitignore 대상이라 새 환경에는 없다. 이 경우 경고를 출력하고 카탈로그만 건너뛴다(spec 참조).
- [x] 주민 seed 모듈 작성 (`src/__tests__/firebase-utils/seed-villagers.js` 신규)
  - 이유: 앱은 주민 검색을 운영 Algolia `Villagers` 인덱스로 하고(`src/hooks/villager/query/useSearchVillagers.ts`), 표시는 Firestore `Villagers` 컬렉션에서 ID로 조회한다(`useVillagersByIds.ts`). 에뮬레이터에는 이 컬렉션이 없어 주민이 표시되지 않는다.
  - 재사용: `algoliasearch/lite`의 `liteClient`와 `.env`의 `EXPO_PUBLIC_ALGOLIA_APP_ID`, `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY`(`src/config/firebase.ts`와 같은 키). 빈 검색어 + `hitsPerPage: 1000`으로 한 번에 417명을 받는다.
  - 저장: `Villagers/{objectID}`에 `Villager` 타입(`src/types/villager.ts`)의 `name`, `imageUrl`, `species`, `personality`만 넣는다. Algolia 동기화 확장이 붙인 `path`, `lastmodified` 등은 버린다.
  - 결정: 시드할 때마다 Algolia에서 가져온다. 비밀 키가 필요 없고, 앱 검색과 같은 출처라 ID가 항상 맞는다(사용자 지시).
- [x] 로컬 전용 `scripts/seed-test-data.js` 삭제
  - git으로 추적되지 않는 파일이라 커밋에는 나타나지 않는다. 기능이 `seed-catalog.js`로 옮겨진 것을 확인한 뒤 삭제한다.

## Phase 3: 단일 진입점과 재실행 안전성

검증: 에뮬레이터를 띄운 상태에서 `npm run emulator:seed`를 두 번 연속 실행해도 두 번 모두 성공하고, 문서 수가 늘어나지 않는다.

- [x] 초기화 단계 추가 (`src/__tests__/firebase-utils/seed-test-data.js` 또는 신규 `reset-emulator.js`)
  - 패턴: 에뮬레이터 REST API `DELETE http://127.0.0.1:8080/emulator/v1/projects/{projectId}/databases/(default)/documents`와 `DELETE http://127.0.0.1:9099/emulator/v1/projects/{projectId}/accounts`. `projectId`는 `firebase-admin-setup.js`와 같은 `animal-crossing-trade-expo-app`.
  - 패턴: Storage는 Admin SDK `getStorage().bucket(EXPO_PUBLIC_STORAGE_BUCKET).deleteFiles()`. 이 스크립트 안에서 `FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199`를 먼저 설정해 에뮬레이터 버킷만 대상으로 한다.
  - 현재 문제: `auth.createUser`는 같은 uid가 있으면 실패하고, 메시지·대댓글은 `.add()`라 실행할 때마다 중복된다.
  - 결정: 시드 전에 Auth·Firestore·Storage를 전부 비운다(사용자 지시).
- [x] 시드하는 동안 Functions 백그라운드 트리거 끄기 (`seed-test-data.js`)
  - 이유: Functions 에뮬레이터가 떠 있으면 `onCommentCreated`·`onReplyCreated`가 `commentCount`를, `updateUserReview`가 유저 `review` 집계를 한 번 더 올리고, `onMessageCreated`·`onNotificationCreated`가 푸시를 시도한다(`functions/src/index.ts`). 시드는 이 값들을 직접 계산해 넣으므로 두 배가 된다.
  - 패턴: Emulator Hub `PUT http://127.0.0.1:4400/functions/disableBackgroundTriggers`로 끄고, 끝나면(실패해도) `enableBackgroundTriggers`로 다시 켠다. Hub에 연결되지 않으면(Functions 에뮬레이터 미실행) 건너뛴다.
- [x] 이미지 업로드 단계 추가 (`src/__tests__/firebase-utils/seed-images.js` 신규, 이미지 폴더 `src/__tests__/firebase-utils/seed-images/{users,communities}/`)
  - 결정: 이미지 파일은 사용자가 로컬에 직접 넣고, 폴더 전체를 `.gitignore`에 추가해 커밋하지 않는다. 폴더 위치와 사용법은 `agent_docs/testing.md`에 적는다. 저장소 용량과 이미지 출처 문제를 피하기 위함(사용자 지시).
  - 폴더 안 파일을 이름순으로 정렬해 유저·게시글에 차례로(모자라면 처음부터 다시) 배정한다. 시드 데이터에 파일명을 직접 적지 않으므로 파일을 바꿔 넣어도 코드는 그대로다.
  - 업로드 경로는 앱과 같은 `Users/{fileName}`, `Communities/{fileName}`(`src/firebase/services/imageService.ts:53`). 두 경로는 `storage.rules`에서 `allow read: if true`라 로그인 없이 표시된다.
  - URL 형식: `http://{EXPO_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/{bucket}/o/{encodeURIComponent(path)}?alt=media`. 호스트를 `.env.local` 값으로 써야 실기기에서도 열린다. 값이 없으면 `127.0.0.1:9199`.
- [x] 환경 변수 파일 로드 (`package.json`)
  - Node는 `.env.local`을 자동으로 읽지 않는다. `emulator:seed`를 `node --env-file-if-exists=.env --env-file-if-exists=.env.local src/__tests__/firebase-utils/seed-test-data.js`로 실행한다(Node 22.9 이상 지원, 현재 v22.13). 뒤에 적은 `.env.local`이 같은 키를 덮어쓴다.
- [x] 단일 진입점 정리 (`src/__tests__/firebase-utils/seed-test-data.js`)
  - 초기화 → 이미지 업로드 → 카탈로그 → 주민 → 유저 → 게시글 → 채팅 → 댓글 → 리뷰·알림 순서로 실행한다(유저·게시글이 이미지 URL을, 게시글 `cart`가 카탈로그 데이터를 참조하므로).
  - 현재 문제: `catch`에서 로그만 찍고 정상 종료(exit 0)한다. 실패하면 exit 1로 끝나게 한다.
- [x] 안전장치 (`src/__tests__/firebase-utils/firebase-admin-setup.js`는 수정하지 않음)
  - 패턴: 이 파일이 `FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`를 강제로 설정하므로 운영 연결 위험은 없다. 진입점에서 이 파일을 반드시 거치게만 한다.

## Phase 4: 문서 정리와 export

검증: `npm run dev:emulator:all` 실행 → 다른 터미널에서 `npm run emulator:seed` → Metro를 Ctrl+C로 종료 → 다시 `npm run dev:emulator:all`로 띄웠을 때 시드 데이터가 그대로 보인다.

- [x] 명령어 문서 갱신 (`agent_docs/commands.md`)
  - `emulator:seed` 설명을 "카탈로그 + 테스트 데이터"로 바꾸고, 시드 후 `dev:emulator:all` 종료 시 `emulator-data/`로 export된다는 흐름을 한 줄로 적는다.
- [x] 테스트 문서 갱신 (`agent_docs/testing.md`)
  - `firebase-utils/` 설명에 seed 진입점, `seed-images/` 폴더 사용법, `SEED_MY_UID`(`.env.local`) 사용법, 카탈로그 원본(`catalog.json`)이 gitignore 대상이라는 제약을 추가한다.
  - 함정 기록: 이미지 URL에 에뮬레이터 호스트가 들어가므로, Mac IP가 바뀌면 시드를 다시 실행해야 이미지가 보인다.
- [x] 실제 export 확인
  - 결정: 기존 `emulator-data/`(8월 16일 데이터)는 `emulator-data.bak/`으로 백업한 뒤 시드 데이터로 덮어쓴다(사용자 지시).
  - 위 검증 절차를 실행하고 `emulator-data/`의 수정 시각이 바뀌었는지 확인한다.

## Phase 5: 시드 파일 위치 정리

검증: `npm run lint`, `npm run emulator:seed`(에뮬레이터 실행 중), `bash -n scripts/emulator/dev-emulator-all.sh`가 통과하고, Maestro 헬퍼 import 경로(`@/__tests__/firebase-utils/...`)는 그대로다.

- [x] `.gitignore`에서 `scripts/*` 제거 (`.gitignore`)
  - 이유: #32에서 로컬 전용 `scripts/seed-test-data.js`를 숨기려고 넣은 규칙인데, 그 파일은 Phase 2에서 삭제했다. 남겨 두면 `scripts/`에 파일을 추가할 때마다 `git add -f`가 필요하다.
- [x] 시드 파일을 `scripts/emulator/`로 이동 (`git mv`)
  - 대상: `src/__tests__/firebase-utils/`의 `seed-test-data.js`, `seed-catalog.js`, `seed-villagers.js`, `seed-images.js`, `emulator-control.js`, 그리고 `scripts/dev-emulator-all.sh`
  - 로컬 이미지 폴더 `seed-images/`도 옮기고 `.gitignore` 경로를 `scripts/emulator/seed-images/`로 바꾼다.
  - 결정: Maestro가 쓰는 `test-helpers.js`, `cleanup-test-data.js`, `firebase-admin-setup.js`는 그대로 두고, 시드는 `firebase-admin-setup.js`를 상대 경로로 가져다 쓴다. 시드 파일이 `src/__tests__/`에 있으면 테스트 코드로 오해되기 때문(사용자 지시).
- [x] 이동에 따른 경로 수정 (`scripts/emulator/*.js`, `dev-emulator-all.sh`, `package.json`)
  - `require('./firebase-admin-setup')` → `src/__tests__/firebase-utils/firebase-admin-setup` 상대 경로, `seed-catalog.js`의 `catalog.json` 경로, `dev-emulator-all.sh`의 저장소 루트 계산(`cd "$(dirname "$0")/../.."`), `dev:emulator:all`·`emulator:seed` 스크립트 경로
- [x] ESLint 예외 추가 (`.eslintrc.js`)
  - 이유: `no-require-imports` 예외가 `**/__tests__/**`에만 있어, 옮긴 CommonJS 시드 파일에서 오류가 났다. `scripts/**/*.js`에 같은 규칙만 꺼 두는 override를 추가했다(구현 중 추가).
- [x] 문서 경로 수정 (`agent_docs/commands.md`, `agent_docs/testing.md`)

## 진행 기록

### 2026-11-13

- Phase 1 완료
- 검증: `firebase emulators:start --only auth,firestore`에 `node src/__tests__/firebase-utils/seed-test-data.js` 실행 → 성공. 저장된 문서를 다시 읽어 게시글 필드, `commentCount`, 채팅 `unreadCount` 키, 유저 `review` 집계, 알림 12개(안 읽음 6개)가 시드 정의와 일치함을 확인
- 결정: 댓글·대댓글·메시지·리뷰·알림은 고정 문서 ID로 저장하고, 앱처럼 `id` 필드는 문서 본문에 넣지 않는다(채팅방만 앱이 `id`를 저장하므로 유지)
- 계획 변경: 구현 중 Functions 트리거가 시드 값을 두 배로 만드는 문제를 발견해 Phase 3에 트리거 끄기 항목을 추가

- Phase 2 완료
- 검증: `firebase emulators:start --only auth,firestore`에서 `seedCatalog()` → 아이템 7,156개·variants 21,788개(약 3초), `seedVillagers()` → 417명 저장. variant 문서 ID `0_0`, 부모 6개 필드, `Villagers` 문서 필드를 다시 읽어 확인. `catalog.json`이 없거나 Algolia 키가 없으면 경고 후 `null`을 반환하는 것도 확인
- 결정: Phase 1 커뮤니티 데이터에 주민 ID를 넣는 작업은 주민 seed 결정(사용자 지시)에 따라 Phase 2에서 함께 처리

- Phase 3 완료
- 검증: 에뮬레이터를 끈 채 `npm run emulator:seed` → ECONNREFUSED와 함께 exit 1
- 검증: 전체 에뮬레이터(Functions 포함)에서 `npm run emulator:seed`를 두 번 연속 실행 → 두 번 모두 성공. 실행 후 `board1.commentCount` 5, 유저 `review` 집계, 게시글 6개·알림 12개·Auth 3명으로 늘어나지 않음. 임시 이미지(프로필 2장, 커뮤니티 4장)로 Storage 업로드와 URL 응답(200, image/png) 확인. 시드 후 댓글을 하나 추가하면 `commentCount`가 1 오르는 것으로 트리거가 다시 켜진 것도 확인
- 결정: 초기화·트리거·버킷 함수는 계획의 `reset-emulator.js` 대신 `emulator-control.js` 한 파일에 둔다(초기화 외 기능도 담기 때문)

- Phase 5 완료
- 검증: `bash -n scripts/emulator/dev-emulator-all.sh` 통과. `npx eslint scripts/emulator src/__tests__/firebase-utils` 통과(`npm run lint`의 남은 오류 3건은 `UpdateModal.tsx`·`ErrorBoundary.tsx`의 기존 오류). Auth·Firestore·Storage 에뮬레이터에서 옮긴 경로로 `npm run emulator:seed` 실행 → 성공(사용자가 넣은 이미지 프로필 10장·커뮤니티 8장 업로드 포함)

- Phase 4 완료
- 검증: `firebase emulators:start --import ./emulator-data --export-on-exit ./emulator-data` → `npm run emulator:seed` → SIGINT 종료 시 "Export complete", `emulator-data/` 수정 시각 갱신. `--import`만으로 다시 띄워 Users 3, Boards 6, Communities 5, Chats 3, Reviews 4, Notifications 12, Villagers 417, CatalogItems 7156, Auth 3, Storage 파일 18개, `board1.commentCount` 5 복원 확인
- 전체 구현 완료
- 결정: `dev:emulator:all`이 운영에 붙은 원인(Metro 실행 중 env 파일 저장 시 셸 값 덮어쓰기)을 확인하고, `EXPO_PUBLIC_USE_FIREBASE_EMULATOR`는 env 파일에 두지 않고 셸에서만 주입하기로 함. `agent_docs/environment.md`에 기록(사용자 지시)

## 기기 확인

- [ ] `.env.local`에 `SEED_MY_UID`를 넣고 `npm run dev:emulator:all` 실행 → 다른 터미널에서 `npm run emulator:seed` → 앱을 새로고침하고 본인 계정으로 로그인하면 1번 유저(모동숲러버)의 게시글·채팅 2개·알림이 내 것으로 보인다
- [ ] 마켓 탭: 6개 게시글에 아이템 이미지·이름·수량·가격이 보이고, 구해요·팔아요·거래완료가 모두 있다
- [ ] 커뮤니티 탭: 게시글 이미지가 `seed-images/communities/` 이미지로 보이고, 힘드러 분양 글은 섬네일에 힘드러 이미지가 보인다
- [ ] 커뮤니티 "다들 최애 주민이 누구인가요?!" 상세: 쭈니·잭슨·미애가 이름·이미지와 함께 보인다
- [ ] 게시글 상세: 댓글·대댓글이 보이고 목록의 댓글 수와 일치한다
- [ ] 채팅 목록: 마지막 메시지와 안 읽은 수가 보인다
- [ ] 프로필: 프로필 사진이 `seed-images/users/` 이미지로 보이고, 받은 리뷰 수가 맞다
- [ ] 새 글 작성: 아이템 검색 → 색상 선택, 주민 검색 → 작성 후 상세에 주민 표시가 동작한다

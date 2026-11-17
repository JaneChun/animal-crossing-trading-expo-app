# 공지사항

> 이슈: 없음
> 작업 종류: 기능 개발
> 상태: 진행중
> 생성일: 2026-11-15

## 개요

운영자가 모든 유저에게 알릴 내용(안드로이드 출시 소식, 거래 매너·거래 방식 안내)을 마켓·커뮤니티 목록 맨 위에 한 줄로 띄우고, 누르면 공지 상세를 보여 준다. 관리자는 어드민 페이지에서 공지를 작성·수정하고 숨기거나 다시 게시한다. 공지는 2~3개만 운영한다.

- 포함: 목록 상단 공지 줄(자동 슬라이드), 공지 상세(본문 URL 링크, 잎 배경), 어드민 공지 관리(게시 중/숨김 탭, 작성·수정 폼, 숨기기 체크박스), Firestore 규칙·인덱스
- 제외: 삭제, 노출 기간, 순서 지정, 이미지 첨부, 푸시 알림, 읽음 처리, 유저용 공지 전체 목록
- 설계와 결정 배경: [design.md](design.md) / 시안: https://claude.ai/artifact/NJpph1owzkyH7fSPt8GZ11 (보드 E, 상세 G′)
- 코드 이름은 `Announcement`를 쓴다. `Notice`는 알림 탭(`src/screens/Notice.tsx`, `NoticeTab`)이 이미 쓰고 있다.

## 확인 필요

아래 문구는 기존 화면 문구를 본떠 계획에 임시로 적은 것이다. 그대로 쓸지, 바꿀지 정해 주세요.

- [ ] 어드민 화면 제목 — '공지 관리' / '새 공지' / '공지 수정' — 막는 항목: Phase 5 화면 등록
- [ ] 어드민 빈 목록 문구 — '게시 중인 공지가 없습니다.' / '숨긴 공지가 없습니다.' — 막는 항목: Phase 5 목록 화면
- [ ] 공지 상세의 없는·숨긴 공지 문구 — '공지를 찾을 수 없습니다.' — 막는 항목: Phase 3 상세 화면

## Phase 1: 타입·데이터 레이어

완료 확인: `npm run typecheck`, `npm run lint` 통과, 에뮬레이터에서 규칙 배포 오류 없음

- [x] `Announcement` 타입 정의 (`src/types/announcement.ts`)
  - 결정: 컬렉션 `Announcements`, 필드 `title: string`, `body: string`, `hidden: boolean`, `createdAt`, `updatedAt` (Timestamp). 기존 컬렉션이 PascalCase(`Boards`, `Reports`)라 맞춤
  - 패턴: 화면 표시용 타입에 `id` 포함 (`src/types/report.ts`의 `Report` 참고)
- [x] 서비스 함수 (`src/firebase/services/announcementService.ts`)
  - 게시 중 목록 조회(`hidden == false`, `createdAt desc`), 관리자 탭 목록 조회(`hidden == 인자`, `createdAt desc`), 단건 조회, 생성, 수정(제목·본문·숨김)
  - 패턴: 모든 요청을 `firestoreRequest(요청명, fn, { throwOnError: true })`로 감싼다 (`src/firebase/services/adminService.ts`의 `fetchReports`, `setPostHidden`)
  - 패턴: 생성·수정 시각은 `serverTimestamp()`
  - 결정: 공지가 2~3개뿐이라 페이지네이션 없이 한 번에 조회 (관리자 목록 포함)
- [x] Firestore 규칙 (`firestore.rules`)
  - 읽기: `resource.data.hidden == false || isAdmin()`. 유저용 쿼리는 반드시 `where('hidden', '==', false)`를 걸어야 규칙을 통과한다
  - 생성·수정: `isAdmin()`만, 삭제: 불가
  - 재사용: 기존 `isAdmin()` 함수
- [x] 복합 인덱스 (`firestore.indexes.json`) — `Announcements`: `hidden ASC, createdAt DESC`

## Phase 2: 조회·변경 훅과 폼

완료 확인: `npm run typecheck`, `npm run lint` 통과

- [x] 게시 중 공지 조회 훅 (`src/hooks/announcement/query/useAnnouncements.ts`)
  - 패턴: `useQuery` + 쿼리 키 함수 export (`src/hooks/admin/query/useAdminReports.ts`)
  - 결정: 실시간 구독 없이 React Query 조회. 탭 재진입·앱 재실행·당겨서 새로고침 때 반영 (design.md)
  - 결정: 탭 재진입 반영은 공지 줄이 포커스될 때 `refetch({ cancelRefetch: false })`로 처리한다. 탭 화면은 언마운트되지 않아 기본 `staleTime`(5분)만으로는 재진입 때 다시 조회되지 않기 때문
- [x] 단건 조회 훅 (`src/hooks/announcement/query/useAnnouncement.ts`)
- [x] 관리자 탭 목록 조회 훅 (`src/hooks/admin/query/useAdminAnnouncements.ts`) — 인자 `hidden`
- [x] 생성·수정 mutation 훅 (`src/hooks/admin/mutation/useCreateAnnouncement.ts`, `useUpdateAnnouncement.ts`)
  - 패턴: 성공 시 관련 쿼리 무효화 + `showToast` (`src/hooks/admin/mutation/useSetPostHidden.ts`)
  - 무효화 대상: 게시 중 목록, 관리자 두 탭 목록, 해당 단건
  - 결정: 토스트 문구는 게시글 토스트 형식을 따른다 (사용자 지시) — 성공 '공지가 작성되었습니다.' / '공지가 수정되었습니다.', 실패 '공지 작성 중 오류가 발생했습니다.' / '공지 수정 중 오류가 발생했습니다.'
- [x] 폼 스키마·훅 (`src/hooks/announcement/form/announcementFormSchema.ts`, `useAnnouncementForm.ts`)
  - 재사용: 제목 1~50자, 본문 1~3000자 규칙과 오류 문구 (`src/hooks/post/form/newPostFormSchema.ts`의 `CommonFields`)
  - 결정: `CommonFields`에 `export`만 붙여 그대로 가져다 쓴다 (규칙·문구를 한곳에서 관리)
  - 패턴: React Hook Form + Zod (`src/hooks/post/form/useNewPostForm.ts`)
  - 필드: `title`, `body`, `hidden`(기본 `false`)

## Phase 3: 공지 상세 화면

완료 확인: 에뮬레이터에서 공지 id로 상세에 진입해 제목·날짜·본문·링크·잎 배경이 라이트·다크 모두 보임

- [x] 본문 URL 링크 텍스트 컴포넌트 (`src/components/Announcement/LinkifiedText.tsx`)
  - 본문을 URL과 일반 텍스트로 나눠 렌더링, URL 탭 시 `Linking.openURL`
  - 재사용: `src/components/ui/Text.tsx` (variant·color 토큰)
  - 패턴: `Linking` 사용 예 `src/screens/Setting.tsx`
- [ ] 공지 상세 화면 (`src/screens/AnnouncementDetail.tsx`) — 시안 보드 상세 G′ — **blocker**: '공지를 찾을 수 없습니다.' 문구 확정 대기 (임시 문구로 구현 완료)
  - 재사용: 없는 경우 `EmptyIndicator` (`src/screens/PostDetail.tsx`의 '게시글을 찾을 수 없습니다.' 처리와 같은 방식)
  - 잎 배경: `assets/images/splash_icon.png`를 스크롤 영역 밖 절대 위치로 배치(스크롤해도 고정), `pointerEvents="none"`, 접근성 숨김, 불투명도 라이트 0.26·다크는 기기에서 조정
  - 날짜 형식 `YYYY년 M월 D일` — 기존 날짜 유틸이 있으면 재사용 (`src/utilities/` 확인)
  - 결정: 같은 형식의 유틸이 없어 `src/utilities/kstDate.ts`에 `formatKstLongDate`를 추가 (기존 KST 기준 날짜 함수들과 같은 기준)
  - 결정: 잎 배경 다크 모드 불투명도는 임시로 0.12. 기기에서 확인 후 조정
- [x] 화면 등록 (`src/types/navigation.d.ts`, `src/navigation/RootStackNavigator.tsx`, `src/utilities/navigationHelpers.ts`)
  - 라우트 `AnnouncementDetail: { id: string }`, 헤더 제목 '공지사항', `commonOptions` 사용
  - 패턴: `navigateToAdminReports` 같은 `navigateToX` 헬퍼

## Phase 4: 목록 상단 공지 줄

완료 확인: 에뮬레이터에서 공지 0·1·3개일 때 마켓·커뮤니티 탭 동작이 spec.md와 같음

- [x] 공지 줄 컴포넌트 (`src/components/Announcement/AnnouncementTicker.tsx`) — 시안 보드 E
  - 재사용: `Badge`(tone `brand`)에 Feather `volume-2` 아이콘, `Text`
  - 패턴: 애니메이션은 `react-native-reanimated` 4 (이미 의존성에 있음)
  - 타이머·애니메이션은 언마운트와 탭 포커스 해제 시 정리
  - 결정: `Badge`는 텍스트만 받아 아이콘을 넣을 수 없다. 공통 컴포넌트를 고치지 않고, 공지 줄 안에서 `Badge`와 같은 brand 색·여백으로 배지 모양을 그린다
  - 결정: 슬라이드는 Reanimated 레이아웃 애니메이션(`SlideInRight`/`SlideOutLeft`, 450ms ease-in-out)을 공지 id key로 교체해 구현. 첫 렌더링은 `LayoutAnimationConfig skipEntering`으로 애니메이션 없이 표시
  - 결정: 공지 개수가 바뀌면 내부 컴포넌트의 key(개수)가 바뀌어 첫 공지부터 다시 시작
  - 결정: 첫 조회 중에는 공지 줄 모양의 스켈레톤을 보여 준다 (사용자 지시, 계획의 '스켈레톤 없음'에서 변경)
- [x] `PostList`에 목록 머리 영역 prop 추가 (`src/components/Home/PostList.tsx`, `src/types/components.ts`의 `PostListProps`)
  - 현재: `FlatList`에 `ListFooterComponent`만 있고 `containerStyle`(좌우 `PADDING`)을 `style`로 받는다 → 머리 영역의 8px 띠를 화면 끝까지 그리려면 좌우 음수 여백이 필요
  - 결정: `ListHeaderComponent`를 옵션 prop으로 받는다. `MyPosts`와 검색은 넘기지 않는다
  - 당겨서 새로고침(`onRefresh`) 시 공지도 다시 조회되게 연결
  - 결정: `PostList`의 새로고침에서 공지 쿼리를 무효화한다. 공지 줄이 없는 화면(내 글·검색)에서는 활성 쿼리가 없어 요청이 생기지 않는다
- [x] 마켓·커뮤니티 연결 (`src/screens/Home.tsx`, `src/screens/Community.tsx`)
  - 커뮤니티는 카테고리 칩 아래, 첫 게시글 위 (칩은 지금처럼 목록 밖 고정)

## Phase 5: 어드민 공지 관리

완료 확인: 관리자 계정으로 작성 → 게시 중 탭·마켓 탭에 표시 → 숨기기 체크 후 저장 → 숨김 탭으로 이동·마켓 탭에서 사라짐 → 다시 게시

- [ ] 공지 관리 목록 화면 (`src/screens/admin/AdminAnnouncements.tsx`) — 게시 중 / 숨김 두 탭 — **blocker**: 빈 목록 문구 확정 대기 (임시 문구로 구현 완료)
  - 재사용: material top tab 설정 그대로 (`src/screens/admin/AdminReports.tsx`), `AdminGuard`
  - 재사용 검토: `src/components/Admin/InfiniteList.tsx` (빈 목록·로딩·오류 처리가 있음. 페이지네이션 없는 데이터에 쓸 수 있는지 확인)
  - 결정: `InfiniteList`를 `hasNextPage={false}`로 그대로 쓴다. 다음 페이지 요청이 생기지 않아 빈 목록·로딩·오류 처리만 재사용된다
  - 새 공지 작성 진입 버튼: 헤더 오른쪽 (패턴은 기존 화면의 `headerRight` 사용 예를 따른다)
  - 결정: `Profile`처럼 `setOptions({ headerRight })`로 Feather `plus` 아이콘을 둔다
- [x] 목록 행 (`src/components/Admin/AnnouncementListItem.tsx`) — 제목, 작성일. 누르면 수정 화면
  - 패턴: `src/components/Admin/ReportListItem.tsx`
- [x] 작성·수정 화면 (`src/screens/admin/AdminAnnouncementEdit.tsx`) — 라우트 인자 `id?`가 있으면 수정
  - 재사용: `TitleInput`, `BodyInput`(`onPasteItemText` 없이), 하단 `Button` 배치 (`src/screens/NewPost.tsx`, `src/components/NewPost/PostForm.tsx`)
  - 재사용: `expo-checkbox` (`src/screens/AgreeToTermsAndConditions.tsx`)
  - 결정: 체크박스에는 '숨기기' 라벨만 두고 안내 문구는 넣지 않는다 (사용자 지시)
- [x] `AdminHome` '운영' 섹션에 '공지 관리' 행 추가 (`src/screens/admin/AdminHome.tsx`)
  - 패턴: `SettingListItem` + `borderRound` (섹션 첫·끝 행 처리 확인)
  - 결정: '검토 필요 유저'와 '에러 내역' 사이에 넣는다. 첫·끝 행의 `borderRound`를 건드리지 않아 `feat/sanction-appeal`과 충돌할 줄이 줄어든다
- [ ] 화면 등록 (`src/types/navigation.d.ts`, `src/navigation/RootStackNavigator.tsx`, `src/utilities/navigationHelpers.ts`) — **blocker**: 화면 제목 확정 대기 (임시 제목으로 구현 완료)
  - 라우트 `AdminAnnouncements: undefined`, `AdminAnnouncementEdit: { id?: string }`
  - 결정: 관리자 라우트 블록 끝에 독립적으로 추가 (`feat/sanction-appeal` 병합 충돌 최소화, design.md)
- [x] 관리자 기능 문서에 공지 관리 추가 (`agent_docs/features/admin.md`)

## 진행 기록

### 2026-11-15

- 워크트리 `node_modules`가 없어 `npm ci` 실행 (메인 저장소와 의존성 동일)
- Phase 1 완료
- 검증: `npm run typecheck` 통과, 변경 파일 `eslint` 통과
- 미검증: 규칙 배포 확인 — 다른 워크트리의 개발용 에뮬레이터(8080)가 실행 중이고 메인 저장소의 규칙 파일을 읽고 있어 이 워크트리의 규칙을 올리지 못함. 기기 확인 목록으로 넘김
- Phase 2 완료
- 검증: `npm run typecheck` 통과, 변경 파일 `eslint` 통과
- Phase 3 완료 (상세 화면 문구는 blocker로 남김)
- 검증: `npm run typecheck` 통과, 변경 파일 `eslint`·`prettier --check` 통과
- Phase 4 완료
- 검증: `npm run typecheck` 통과, 변경 파일 `eslint` 통과(경고 2건은 기존 `Home`·`Community`의 `useFocusEffect` 의존성 경고), `npx jest src/__tests__` 65개 통과
- Phase 5 완료 (화면 제목·빈 목록 문구는 blocker로 남김)
- 검증: `npm run typecheck` 통과, `npm run lint` 오류 0건(경고 47건은 기존 경고 + `expo-checkbox` 기본 import 경고 1건으로 약관 화면과 같은 형태), `npx jest src/__tests__` 65개 통과

## 기기 확인

- [ ] 에뮬레이터에 이 워크트리의 `firestore.rules`를 올렸을 때 규칙 오류 없이 시작된다
- [ ] 로그아웃 상태로 마켓 탭을 열면, 게시 중 공지가 있을 때 목록 첫 줄에 '공지' 배지와 제목, 그 아래 화면 양끝까지 닿는 회색 띠가 보인다
- [ ] 게시 중 공지가 0개면 공지 줄과 띠가 모두 보이지 않는다
- [ ] 게시 중 공지가 1개면 전환 없이 고정되고, 3개면 4초마다 오른쪽에서 들어오며 마지막 다음은 첫 공지로 같은 방향으로 이어진다
- [ ] 다른 탭에 갔다 돌아오면 전환이 멈췄다가 이어지고, 관리자가 바꾼 공지가 반영된다
- [ ] 목록을 내리면 공지 줄이 함께 올라가 사라지고, 당겨서 새로고침하면 공지도 다시 조회된다
- [ ] 커뮤니티 탭에서 공지 줄이 카테고리 칩 아래·첫 글 위에 있고, 카테고리를 바꿔도 그대로다
- [ ] 내 프로필 작성 글 목록과 검색 결과에는 공지 줄이 없다
- [ ] 공지 줄을 누르면 그 순간 보이던 공지의 상세가 열리고, 헤더에 '공지사항'이 보인다
- [ ] 상세에서 제목·작성일(`2026년 11월 15일` 형식)·구분선·본문이 보이고 줄바꿈이 유지된다
- [ ] 본문의 `https://` 링크가 민트색 밑줄로 보이고, 누르면 브라우저나 스토어 앱이 열린다. `www.`만 있는 글자는 링크가 아니다
- [ ] 잎 배경이 오른쪽 아래에 기울어져 깔리고, 본문을 스크롤해도 움직이지 않는다. 다크 모드에서 불투명도(임시 0.12)가 적당한지 본다
- [ ] 일반 유저가 숨긴 공지의 상세로 들어가면 '찾을 수 없음' 안내가 보인다
- [ ] 관리자 홈 '운영'에 '공지 관리'가 보이고, 게시 중 / 숨김 탭과 빈 목록 안내가 보인다
- [ ] 헤더 오른쪽 + 버튼으로 새 공지를 저장하면 성공 토스트 후 목록으로 돌아가고, 게시 중 탭과 마켓 탭에 나타난다
- [ ] 수정 화면에서 '숨기기'를 체크하고 저장하면 숨김 탭으로 옮겨지고 마켓 탭에서 사라진다. 다시 해제하면 게시 중으로 돌아온다
- [ ] 제목·본문을 비우거나 길이를 넘기면 게시글 폼과 같은 오류 문구가 보인다
- [ ] 저장 중에는 버튼이 비활성되고, 네트워크를 끊고 저장하면 오류 토스트가 뜨고 입력 내용이 남는다

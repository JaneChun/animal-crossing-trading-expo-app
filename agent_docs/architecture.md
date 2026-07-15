# 아키텍처

## 상태 관리 매핑

| 종류 | 도구 → 위치 |
|------|-------------|
| 서버 상태 | React Query → `src/hooks/{domain}/query`, `mutation` |
| 전역 상태 | Zustand → `src/stores/{domain}/` |
| 폼 상태 | React Hook Form + Zod → `src/hooks/{domain}/form/` |
| URL/딥링크 | React Navigation `linking` → `App.tsx` |

## 진입점 (`App.tsx`)

Provider 중첩 구조와 초기화 훅 목록은 `App.tsx`를 직접 읽고 파악할 것. 지켜야 할 제약:

- 초기화 훅은 인증(`useAuthInitializer`)이 가장 먼저 — 새 구독/초기화 훅은 인증 이후 순서를 지켜 추가.
- React Query 컨텍스트에 의존하는 구독 훅(알림·채팅 등)은 `QueryClientProvider` 하위인 `AppContent`에서 실행해야 함.
- **스플래시 표시/해제는 `RootStackNavigator`의 `isAppInitializing` 분기가 단일 소유** (`src/navigation/RootStackNavigator.tsx:45`) — 개별 훅에서 스플래시를 제어하지 말 것.
- React Query 기본 설정(staleTime 등)은 `App.tsx`의 QueryClient 생성부 참조.

## 주요 패턴

- **도메인 중심 훅 구조**: `src/hooks/{domain}/{query|mutation|form}/` (예: `src/hooks/post/query/useInfinitePosts.ts`)
- **Zustand 스토어 모듈 구조**: `src/stores/auth/` 구조를 따를 것. 초기화는 `App.tsx`에서 `use{Domain}Initializer` 훅으로 호출.
- **검색은 Algolia 쿼리 훅**: `useSearchPosts.ts`, `useSearchItems.ts`
- **게시글 상태 필터**: 조회 시 `where('status', 'not-in', ['hidden', 'deleted'])`로 숨김/삭제 게시글 제외 (`useInfinitePosts.ts`)

## 네비게이션

- 화면 밖 네비게이션은 `src/navigation/RootNavigation.ts`의 `navigationRef` 사용.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "모동숲 마켓" (Animal Crossing Trading Market) - a React Native mobile app built with Expo that serves as a trading marketplace for Animal Crossing: New Horizons items for Korean users. The app features real-time chat, social authentication, push notifications, and comprehensive trading functionality.

## Common Development Commands

### Development

```bash
npm run dev              # Start development server with dev client
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
```

### Building

```bash
npm run build:ios:dev    # Build development iOS
npm run build:android:dev  # Build development Android
npm run build:ios:prod   # Build production iOS
npm run build:android:prod # Build production Android
```

### Testing and Linting

```bash
npm run test             # Run Jest tests with watch mode
npm run lint             # Run ESLint
```

### Firebase Functions

```bash
cd functions
npm run serve            # Start local Firebase emulator
npm run deploy           # Deploy functions to Firebase
```

### Firebase Emulator (Development)

```bash
# 에뮬레이터 시작 (Auth, Functions - Java 설치 시 Firestore 추가 가능)
npm run emulator:start

# 에뮬레이터와 함께 앱 개발 시작
npm run dev:emulator

# 에뮬레이터 중지
Ctrl+C 또는 firebase emulators:exec --only auth,functions 'echo stopped'
```

### EAS Build and Deploy

```bash
npm run deploy          # EAS build and submit to app stores
```

## Architecture Overview

### Core Technologies

- **React Native** (0.76.6) with **Expo SDK** (52) - New Architecture enabled
- **Firebase** - Backend services (Auth, Firestore, Functions, Storage, Realtime Database)
- **Zustand** - Global state management
- **React Query** (TanStack Query v5) - Server state management and caching
- **React Navigation** v7 - Navigation with deep linking support
- **React Hook Form + Zod** - Form validation

### Project Structure

```
src/                    # All application source code
├── __tests__/          # Unit tests (Maestro E2E tests at root)
├── components/         # UI components organized by feature
│   ├── Block/          # User blocking components
│   ├── Chat/           # Chat and messaging
│   ├── Community/      # Community features
│   ├── Home/           # Home screen components
│   ├── NewPost/        # Post creation
│   ├── PostDetail/     # Post detail view
│   ├── Profile/        # User profile
│   ├── Search/         # Search functionality
│   └── ui/             # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation setup
├── hooks/              # Custom hooks organized by feature
├── stores/             # Zustand state stores
├── firebase/           # Firebase services
│   ├── core/           # Core Firebase utilities
│   └── services/       # Firebase service layer
├── types/              # TypeScript definitions
├── utilities/          # Helper functions
├── constants/          # App constants and configuration
├── config/             # App configuration
│   ├── firebase.ts     # Firebase initialization (formerly fbase.js)
│   └── reactotron.ts   # Reactotron dev configuration
└── declarations.d.ts   # Module declarations

__tests__/maestro/      # Maestro E2E tests (root level)
functions/              # Firebase Cloud Functions
assets/                 # Static assets (images, fonts, etc.)
App.tsx                 # Root app component (Expo entry point)
```

### Key Features & Patterns

#### Authentication System

- **Social Login**: Kakao, Naver, Apple authentication via Firebase
- **Custom Naver Integration**: Custom token exchange via Firebase Functions due to library limitations
- **Session Management**: AsyncStorage persistence with Zustand

#### Real-time Features

- **Chat System**: Firebase Realtime Database with Gifted Chat UI
- **Push Notifications**: Expo Notifications + Firebase Cloud Messaging with deep linking
- **Presence System**: Track active chat room to prevent duplicate notifications

#### Data Management

- **Firestore Chunking**: Custom hooks to overcome 10-item limit in `where in` queries
- **Infinite Scroll**: React Query's `useInfiniteQuery` for posts and items
- **Image Handling**: Expo Image Picker with Firebase Storage and compression

#### Search & Discovery

- **Algolia Integration**: Full-text search for posts and items
- **Item Database**: Comprehensive Animal Crossing item catalog
- **Filtering System**: Advanced search with multiple criteria

#### User Safety

- **Blocking System**: User blocking across posts, comments, and chat
- **Reporting**: Content and user reporting functionality
- **Profanity Filter**: Korean profanity filtering with `cenkor` library

### State Management Architecture

#### Zustand Stores

- **AuthStore**: User authentication and profile
- **ChatStore**: Chat state and active room tracking
- **NotificationStore**: Push notification management
- **BlockStore**: User blocking state

#### React Query Patterns

- **Chunked Queries**: Handle large ID arrays by splitting into 10-item chunks
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Infinite Queries**: Cursor-based pagination for posts and items

### Firebase Architecture

#### Services (`src/firebase/services/`)

- **authService**: Social login implementations
- **userService**: User profile management
- **postService**: Trading post CRUD operations
- **chatService**: Real-time messaging
- **notificationService**: Push notification handling

#### Cloud Functions (`functions/`)

- **Custom Auth**: Naver login token exchange
- **Notification Triggers**: Automated push notifications
- **Admin Utilities**: Data management and cleanup

### Navigation Structure

- **Root Stack**: Main navigation container with auth flow
- **Tab Navigator**: Bottom tabs for Home, Community, Profile, Chat, Notice
- **Deep Linking**: Support for notification and chat deep links
- **Scheme**: `animal-crossing-trading-app://`

### Development Notes

#### Testing

- **Jest**: Test runner with `jest-expo` preset
- **No existing tests**: Infrastructure ready but tests not yet implemented

#### Build Configuration

- **EAS Build**: Configured for development, preview, and production
- **Bundle ID**: `com.janechun.animalcrossingtradingapp`
- **New Architecture**: Enabled for both platforms

#### Environment Variables

- Kakao Native App Key
- EAS Project ID
- Firebase configuration (handled by Firebase SDK)

#### Known Limitations

- **Naver Login**: Requires custom Firebase Function due to library limitations
- **Firestore Queries**: 10-item limit on `where in` queries (handled with chunking)
- **iOS Permissions**: Camera and photo library access required for image features
- **Platform Support**: Currently developed primarily for iOS - Android compatibility and platform-specific features need to be addressed for full cross-platform support

---

## 🔧 프로젝트 리팩토링 및 테스트 코드 작성 요청사항

### 1. 코드 리팩토링 우선순위

#### 높음 (Critical)

- **보안 강화**: Firebase 규칙 검토 및 사용자 입력 검증 강화
- **에러 핸들링**: 네트워크 오류, Firebase 오류에 대한 일관된 처리
- **메모리 누수 방지**: 컴포넌트 언마운트 시 리스너 정리
- **Korean 텍스트 처리**: 욕설 필터링 및 텍스트 검증 개선

#### 중간 (Important)

- **코드 중복 제거**:
  - Firebase service 호출 패턴 통일
  - 공통 UI 컴포넌트 추출 (로딩 상태, 에러 상태)
  - 이미지 처리 로직 통합
- **성능 최적화**:
  - React Query 캐싱 전략 개선
  - 이미지 지연 로딩 및 압축 최적화
  - Firestore 쿼리 효율화
- **타입 안정성**:
  - Firebase 데이터 타입 정의 강화
  - API 응답 타입 검증
  - Zustand store 타입 개선

#### 낮음 (Nice to have)

- **코드 스타일 통일**: ESLint 규칙 강화 및 Prettier 설정
- **컴포넌트 구조 개선**: 더 작은 단위로 분할
- **커스텀 훅 최적화**: 재사용성 개선

### 2. 테스트 코드 작성 계획

#### 단위 테스트 (Unit Tests)

```
src/__tests__/
├── components/
│   ├── ui/              # 재사용 가능한 UI 컴포넌트 테스트
│   ├── Chat/            # 채팅 컴포넌트 테스트
│   └── PostDetail/      # 게시글 상세 컴포넌트 테스트
├── hooks/
│   ├── useAuth.test.ts          # 인증 훅 테스트
│   ├── useInfiniteQuery.test.ts # 무한 스크롤 훅 테스트
│   └── useFirestore.test.ts     # Firestore 훅 테스트
├── stores/
│   ├── authStore.test.ts        # 인증 스토어 테스트
│   ├── chatStore.test.ts        # 채팅 스토어 테스트
│   └── blockStore.test.ts       # 차단 스토어 테스트
├── utilities/
│   ├── validation.test.ts       # 검증 유틸리티 테스트
│   ├── textFilter.test.ts       # 텍스트 필터링 테스트
│   └── imageUtils.test.ts       # 이미지 처리 테스트
└── firebase/
    └── services/
        ├── authService.test.ts      # 인증 서비스 테스트
        ├── postService.test.ts      # 게시글 서비스 테스트
        └── chatService.test.ts      # 채팅 서비스 테스트
```

#### 통합 테스트 (Integration Tests)

- **인증 플로우**: 소셜 로그인 → 프로필 설정 → 로그아웃
- **게시글 작성**: 이미지 업로드 → 게시글 생성 → 목록 표시
- **채팅 시스템**: 채팅방 생성 → 메시지 송수신 → 알림 처리
- **검색 기능**: Algolia 검색 → 결과 필터링 → 상세 조회

#### E2E 테스트 (Detox)

- **주요 사용자 여정**:
  - 회원가입 → 첫 게시글 작성 → 다른 사용자와 채팅
  - 아이템 검색 → 관심 게시글 저장 → 거래 채팅
  - 프로필 설정 → 알림 설정 → 사용자 차단

### 3. 테스트 환경 설정

#### Firebase 에뮬레이터 통합

```bash
# Firebase 에뮬레이터 설정
firebase emulators:start --only firestore,auth,functions,storage

# 테스트 실행
npm run test                 # 단위 테스트
npm run test:integration     # 통합 테스트
npm run test:e2e            # E2E 테스트
npm run test:coverage       # 커버리지 리포트
```

#### 목표 커버리지

- **전체 코드 커버리지**: 80% 이상
- **중요 비즈니스 로직**: 95% 이상
- **UI 컴포넌트**: 70% 이상
- **Firebase 서비스**: 90% 이상

### 4. 품질 향상 요청사항

#### 코드 품질 도구

- **ESLint**: React Native, TypeScript 규칙 강화
- **Prettier**: 코드 포맷팅 자동화
- **Husky**: 커밋 전 린트 및 테스트 실행
- **TypeScript**: strict 모드 적용

#### 성능 모니터링

- **React Native Performance**: 렌더링 최적화
- **Firebase Performance**: 네트워크 요청 모니터링
- **Bundle Analyzer**: 번들 크기 최적화

#### 접근성 (Accessibility)

- **Screen Reader**: 한국어 스크린 리더 지원
- **색상 대비**: WCAG 2.1 AA 준수
- **터치 영역**: 최소 44pt 크기 보장

### 5. 특별 고려사항

#### 한국 사용자 맞춤

- **한글 입력 처리**: 조합 문자 처리 및 검증
- **한국어 욕설 필터**: cenkor 라이브러리 테스트 강화
- **시간대 처리**: KST 기준 시간 표시

#### Animal Crossing 컨텍스트

- **아이템 데이터**: 정확한 아이템 정보 검증
- **거래 시스템**: 사기 방지 로직 테스트
- **커뮤니티 기능**: 건전한 커뮤니티 유지 기능

### 6. 결과물 요청사항

#### 코드 리팩토링 결과물

- 리팩토링된 전체 코드베이스
- 성능 개선 보고서
- 타입 안정성 강화 리포트
- 보안 검토 및 개선사항 문서

#### 테스트 코드 결과물

- 포괄적인 테스트 스위트
- 테스트 커버리지 리포트
- CI/CD 파이프라인 통합
- 테스트 실행 및 유지보수 가이드

#### 문서화

- 업데이트된 README.md
- API 문서 (Firebase Functions)
- 컴포넌트 스토리북 (선택사항)
- 개발자 온보딩 가이드

---

## 개발 환경 설정

### 로컬 개발 (Firebase Emulator)

1. **에뮬레이터 환경 설정**:
   ```bash
   # 에뮬레이터 시작
   npm run emulator:start
   
   # 새 터미널에서 앱 시작 (에뮬레이터 모드)
   npm run dev:emulator
   ```

2. **에뮬레이터 UI 접근**: http://localhost:4000
   - Auth: http://localhost:9099
   - Functions: http://localhost:5001

3. **Java 설치 (Firestore 에뮬레이터 사용 시 필요)**:
   ```bash
   # macOS
   brew install openjdk@11
   
   # 환경 변수 설정
   export JAVA_HOME=/opt/homebrew/opt/openjdk@11
   ```

### 환경 변수 관리

- **프로덕션**: `.env` 파일 사용
- **로컬 개발**: `.env.local` 파일 사용 (에뮬레이터 설정)
- **중요**: `.env.local`은 Git에 커밋하지 않음

### 보안 주의사항

1. **Firebase 보안 규칙**: Console에서 로컬 파일로 이전 권장
2. **민감한 정보**: 환경 변수로 관리, 소스코드에 하드코딩 금지
3. **에뮬레이터**: 개발용으로만 사용, 프로덕션 데이터와 분리

When working with this codebase, always consider the Korean user base and Animal Crossing context when implementing features. The app uses comprehensive error handling, loading states, and user feedback patterns throughout.

**리팩토링 시 특별히 주의할 점**: 기존 사용자 데이터 호환성 유지, 실시간 채팅 기능 안정성, 그리고 한국어 텍스트 처리의 정확성을 보장해야 합니다.

---

# 📚 Extracted Coding Patterns & Best Practices

*This section was automatically generated by analyzing 200+ git commits and the codebase structure.*

## Commit Conventions

이 프로젝트는 **Conventional Commits** 형식을 사용하며, 한국어로 작성됩니다:

### Commit Type Distribution (최근 200개 커밋 분석)
- `refactor:` (55) - 코드 리팩토링 (가장 많이 사용)
- `feat:` (44) - 새로운 기능 추가
- `fix:` (39) - 버그 수정
- `chore:` (32) - 빌드/설정 관련 작업
- `style:` (8) - 스타일 변경
- `test:` (7) - 테스트 관련
- `perf:` (1) - 성능 개선

### Commit Message Format
```
<type>: <한국어 설명>

# Examples:
feat: 분양/입양 게시글 작성 시 주민 선택 기능 추가
fix: 온보딩 중 업데이트 모달 노출 방지
refactor: useVillagersByIds 훅 분리 및 useVillagerState 개선
chore: 앱 버전 1.2.2에서 1.4.0으로 업데이트
style: VillagerSelectItem 패딩 수정
test: Maestro로 게시글 CRUD E2E 테스트 코드 작성
```

### Key Insights
- **Refactor-first culture**: 리팩토링이 가장 많이 사용되는 커밋 타입으로, 코드 품질에 대한 높은 관심을 보임
- **Korean language**: 모든 커밋 메시지는 한국어로 작성
- **Detailed descriptions**: 단순히 "버그 수정"이 아닌 구체적인 설명 제공

## Workflow Patterns

### Pattern 1: Adding a New Feature (Domain-Driven)

이 프로젝트는 도메인 중심 개발 패턴을 따릅니다.

**Example: Adding Villager Selection Feature**

1. **Types First** - Define data structures
   ```typescript
   // src/types/villager.ts
   export type Villager = { ... }
   ```

2. **Constants** - Add related constants
   ```typescript
   // src/constants/post.ts
   export const VILLAGER_CATEGORIES = { ... }
   ```

3. **Hooks (Query)** - Data fetching
   ```typescript
   // src/hooks/villager/query/useVillagers.ts
   // src/hooks/villager/query/useSearchVillagers.ts
   // src/hooks/villager/query/useVillagersByIds.ts
   ```

4. **Hooks (Form)** - Form state management
   ```typescript
   // src/hooks/post/form/useVillagerState.ts
   // src/hooks/post/form/newPostFormSchema.ts
   ```

5. **Components** - UI components
   ```typescript
   // src/components/NewPost/VillagerSelect.tsx
   // src/components/NewPost/VillagerSelectItem.tsx
   // src/components/NewPost/VillagerList.tsx
   // src/components/PostDetail/VillagerSummaryList.tsx
   ```

6. **Screens** - Integrate into screens
   ```typescript
   // src/screens/NewPost.tsx
   // src/screens/PostDetail.tsx
   ```

7. **Backend Rules** - Update Firestore rules
   ```
   // firestore.rules
   ```

8. **Testing** - Add E2E tests
   ```javascript
   // __tests__/maestro/villager-selection.test.js
   ```

**Commit Sequence:**
```bash
feat: Villager 타입 및 상수 정의 추가
feat: 주민 목록 조회를 위한 useVillagers 훅 및 Firestore 규칙 추가
feat: 분양/입양 게시글 작성 시 주민 선택 기능 추가
refactor: useVillagersByIds 훅 분리 및 useVillagerState 개선
feat: 게시글 상세에서 분양/입양 주민 정보 표시
style: NewPost 폼 UI 개선
```

### Pattern 2: Hook Organization

Hooks are organized by domain, then by type:

```
src/hooks/{domain}/
  ├── query/              # Data fetching hooks
  │   ├── useInfinite{Domain}.ts
  │   ├── use{Domain}ById.ts
  │   ├── use{Domain}sByIds.ts
  │   └── useSearch{Domain}.ts
  ├── mutation/           # Data mutation hooks
  │   ├── useCreate{Domain}.ts
  │   ├── useUpdate{Domain}.ts
  │   └── useDelete{Domain}.ts
  └── form/               # Form state hooks
      ├── use{Domain}State.ts
      └── {domain}FormSchema.ts
```

**Existing Domains:**
- `chat/` - Chat functionality
- `comment/` - Comment operations
- `firebase/` - Firebase utilities
- `item/` - Item management
- `notification/` - Notifications
- `post/` - Post operations (most complex: has query/, form/, mutation/)
- `profile/` - Profile management
- `reply/` - Reply operations
- `shared/` - Shared utilities (15 items)
- `villager/` - Villager features

### Pattern 3: Zustand Store Structure

Each store follows a modular structure:

```
src/stores/{domain}/
  ├── store.ts         # Store definition
  ├── types.ts         # Type definitions
  ├── index.ts         # Public API (exports store + hooks)
  ├── initializer.ts   # Initialization logic
  ├── providers/       # Domain-specific providers (optional)
  └── utils/           # Domain-specific utilities (optional)
```

**Example: Auth Store**
```typescript
// src/stores/auth/store.ts
export const useAuthStore = create<AuthState>((set) => ({ ... }))

// src/stores/auth/types.ts
export type AuthState = { ... }

// src/stores/auth/index.ts
export * from './store'
export * from './types'

// src/stores/auth/initializer.ts
export const initializeAuth = async () => { ... }

// src/stores/auth/providers/
// - kakao.ts, naver.ts, apple.ts

// src/stores/auth/utils/
// - storage.ts, session.ts
```

### Pattern 4: React Query Patterns

**Query Hooks Location:**
```
src/hooks/{domain}/query/
  - useInfinite{Domain}.ts    # Infinite scroll
  - use{Domain}ById.ts         # Single item
  - use{Domain}sByIds.ts       # Multiple items (chunked)
  - useSearch{Domain}.ts       # Search queries
```

**Common Patterns:**

1. **Infinite Queries** - 무한 스크롤
   ```typescript
   useInfiniteQuery({
     queryKey: ['posts', filters],
     queryFn: ({ pageParam }) => fetchPosts(pageParam),
     getNextPageParam: (lastPage) => lastPage.nextCursor,
   })
   ```

2. **Chunked Queries** - Firestore `in` 쿼리 10개 제한 우회
   ```typescript
   // src/hooks/villager/query/useVillagersByIds.ts
   // 1. Chunk array into groups of 10
   // 2. Execute parallel queries with useQueries
   // 3. Merge results
   // 4. IMPORTANT: Reorder to match original villagerIds order
   ```

3. **Algolia Search** - 전체 텍스트 검색
   ```typescript
   useInfiniteQuery({
     queryKey: ['search', 'villagers', searchText],
     queryFn: ({ pageParam }) => searchAlgolia(searchText, pageParam),
   })
   ```

### Pattern 5: Hook Refactoring

훅 개선은 이 프로젝트에서 자주 발생하는 작업입니다 (55 refactor commits).

**Common Refactoring Patterns:**

1. **Query Optimization** - Firestore 쿼리 최적화
2. **Cache Management** - React Query 캐시 전략 개선
3. **Hook Splitting** - 복잡한 훅을 작은 단위로 분리
4. **Algolia Integration** - 검색 기능을 Algolia로 전환
5. **Type Improvements** - 타입 안정성 강화

## Naming Conventions

| Type | Convention | Examples |
|------|-----------|----------|
| **Hooks** | `use` + PascalCase | `useVillagers`, `useSearchItems`, `useNewPostForm` |
| **Screens** | PascalCase | `PostDetail`, `NewPost`, `ChatRoom`, `Profile` |
| **Components** | PascalCase | `VillagerSelectItem`, `PostForm`, `CommunityThumbnail` |
| **Stores** | PascalCase + `Store` | `AuthStore`, `ChatStore`, `NotificationStore` |
| **Types** | PascalCase | `Villager`, `Post`, `User`, `ChatMessage` |
| **Files** | lowercase or PascalCase | `firebase.ts`, `Color.ts`, `PostDetail.tsx` |

## Critical Technical Patterns

### Firestore 'in' Query Chunking

**Problem**: Firebase limits `where(field, 'in', array)` queries to 10 items maximum.

**Solution**: Implement chunking pattern with React Query's `useQueries`:

```typescript
export const useVillagersByIds = (villagerIds: string[]) => {
  // 1. Chunk array into groups of 10
  const chunks = chunkArray(villagerIds, 10);

  // 2. Execute parallel queries
  const queries = useQueries({
    queries: chunks.map(chunk => ({
      queryKey: ['villagers', 'byIds', chunk],
      queryFn: () => getVillagersByIds(chunk),
    })),
  });

  // 3. Merge results
  const allVillagers = queries.flatMap(q => q.data ?? []);

  // 4. CRITICAL: Reorder to match original villagerIds
  const orderedVillagers = villagerIds
    .map(id => allVillagers.find(v => v.id === id))
    .filter(Boolean);

  return orderedVillagers;
};
```

**Key Points:**
- Always chunk arrays larger than 10 items
- Use `useQueries` for parallel execution
- **Always reorder** results to match original array order (critical for UI)
- Handle loading and error states from multiple queries

### React Query Caching Strategy

```typescript
// Frequently accessed data
staleTime: 5 * 60 * 1000, // 5 minutes

// User-specific data
staleTime: 1 * 60 * 1000, // 1 minute

// Search results
staleTime: 30 * 1000, // 30 seconds
```

## Testing Strategy

### Maestro E2E Tests

```
__tests__/maestro/
  ├── auth-flow.test.js        # 회원가입, 로그인, 로그아웃, 탈퇴
  ├── post-crud.test.js        # 게시글 CRUD
  ├── trading-flow.test.js     # 거래 전체 플로우
  └── profile.test.js          # 프로필 수정
```

**Testing Pattern:**
1. Add `testID` props to components for E2E testing
2. Use custom test sequencer for test order control
3. Firebase Functions have separate unit/integration tests

**When adding features**: Always add `testID` props for Maestro:
```tsx
<Button testID="submit-post-button">Submit</Button>
<TextInput testID="post-title-input" />
<View testID="villager-list">...</View>
```

## Most Changed Files (High Activity Areas)

이 파일들은 가장 자주 변경되므로 특별한 주의가 필요합니다:

1. `src/types/components.ts` (20회) - Component type definitions
2. `src/screens/PostDetail.tsx` (17회) - Post detail screen
3. `package.json` (17회) - Dependencies
4. `src/screens/NewPost.tsx` (12회) - Post creation
5. `src/screens/ChatRoom.tsx` (11회) - Chat functionality
6. `src/navigation/RootStackNavigator.tsx` (10회) - Navigation

## Performance Optimization

### Firestore Query Optimization
- Use `where(__name__, in)` for batch queries
- Limit `in` queries to 10 items (Firebase limitation)
- Implement chunking for larger datasets
- Reorder results to match original array order

### Image Optimization
- Compress before upload
- Use Expo Image for efficient rendering
- Lazy load images in lists

## Key Takeaways for Development

When working on this codebase:

1. **Always use Korean** for commit messages and user-facing text
2. **Follow domain-driven structure**: Group by feature (post, villager, chat) then by type (query, form, mutation)
3. **Refactor proactively**: This team values code quality highly (55 refactor commits)
4. **Use React Query patterns**: Infinite queries, chunked queries, Algolia integration
5. **Organize stores modularly**: Each store has store.ts, types.ts, index.ts, initializer.ts
6. **Add testID for E2E**: Maestro tests require testID props
7. **Handle Firestore limitations**: Chunk arrays for `in` queries (10 item limit)
8. **Korean context matters**: Profanity filtering, timezone, language processing
9. **Firebase emulator for local dev**: Never test directly on production
10. **Security first**: Always update Firestore rules when adding new features

---

*Note: Instinct files for continuous learning have been generated in `.claude/instincts/`*

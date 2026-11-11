# 디자인 시스템 구축 + 다크 모드

> 이슈: 없음
> 작업 종류: 기능 개발
> 상태: 진행중
> 생성일: 2026-11-11

## 개요

이 앱은 2026-02에 `src/theme/`(Color·Spacing·BorderRadius·Shadow)와 `src/constants/Typography.ts`로 토큰의 기초를 만들었지만, 색상만 실제로 쓰이고 나머지 토큰은 거의 쓰이지 않는다. 조사 시점(2026-11-11) 기준 수치는 다음과 같다.

- 색상: `Colors.*`를 116개 파일이 쓰고, 그중 104개 파일은 모듈 최상단의 `StyleSheet.create` 안에서 읽는다. 이 값은 import 시점에 고정되므로 지금 구조로는 테마를 바꿀 수 없다. JSX prop에 직접 넣은 `Colors`도 61곳 있다.
- 간격·모서리: `Spacing`은 5개 파일, `BorderRadius`는 4개 파일만 쓴다. `padding/margin: 숫자` 리터럴이 389건, `borderRadius: 숫자`가 79건이다.
- 글자: `FontSizes`·`FontWeights` 조합이 화면마다 따로 쓰이고(70개 파일), react-native `Text`를 직접 import하는 파일이 74개다.
- 컴포넌트: `Button`은 `color`(mint/white/gray/red/redWhite)와 `size`(md2/lg/lg2)라는 의미가 드러나지 않는 API를 쓴다. `Badge`는 색을 호출부에서 hex로 받는다.
- 다크 모드: `app.config.js`가 `userInterfaceStyle: 'automatic'`이라서, 기기가 다크 모드이면 Alert·ActionSheet·키보드는 이미 어둡게 바뀌고 앱 화면만 밝게 남는다.

목표는 두 가지다. (1) 참고 프로젝트(`~/Projects/compose_mobile_order`)의 구조, 즉 primitive 팔레트와 semantic 토큰의 2단 계층, `variant`·`size` 기반 컴포넌트 API, 공통 `Text`를 강제하는 ESLint 가드레일을 이 앱에 맞게 옮긴다. (2) 그 위에 기기 설정을 따르는 다크 모드를 얹는다.

- 스타일링: NativeWind·cva는 도입하지 않고 StyleSheet를 유지한다(사용자 결정: 121개 파일이 StyleSheet 기반이고 출시 중인 앱이라 점진 적용이 가능함).
- 테마 전환: Unistyles 대신 자체 `ThemeProvider` + `useThemedStyles` 훅으로 구현한다(사용자 결정: 서드파티 style prop 45곳과 JSX 색 61곳은 어느 방식이든 훅이 필요해서 Unistyles의 변경량 이점이 작고, 네이티브 의존성·babel 플러그인·RN 버전 결합을 피함).
- 출시 전략: 모든 도메인을 이 계획에서 옮긴다. 마이그레이션이 끝날 때까지 `DARK_MODE_ENABLED = false`로 앱 테마를 라이트로 고정하고, 마지막 Phase에서 켠다. 그래서 중간 커밋을 언제 배포해도 화면은 지금과 같다(사용자 결정).
- 제외: 앱 내 테마 설정 화면(기기 설정만 따름, 사용자 결정), 커스텀 폰트, 스플래시 이미지의 다크 버전, 주 버튼 대비 개선(진행 기록 참조)

## Phase 1: 토큰 재정비

Phase 1이 끝나도 화면은 바뀌지 않아야 한다(인증 뱃지 아이콘 1곳 제외). 기존 hex 값을 바꾸지 않고 구조만 정리한다.

- [x] primitive 팔레트 정의 (`src/theme/palette.ts`)
  - 재사용: `src/theme/Color.ts`의 현재 hex 값 전부를 mint/gray/red/orange/yellow/green/blue/lavender/purple 단계로 분류하고, `spec.md`의 다크 값도 같은 파일에 단계로 추가한다
  - 패턴: 참고 프로젝트 `tailwind.colors.js`의 `coye`, `coor` 50~950 단계 구조
  - 결정: 민트는 `mint.400 #35d8c9`(면·활성)과 `mint.600 #06A98A`(연한 민트 배경 위 글자) 2단계만 둔다. `#3AECDB`는 팔레트에 넣지 않는다(사용자 결정, 시안 B안)
- [x] semantic 색상 스킴 정의 (`src/theme/Color.ts`)
  - `ColorScheme` 타입과 `lightColors`, `darkColors` 두 객체를 만든다. 키 구조는 기존 `Colors.text/bg/border/icon/status/overlay/social`을 그대로 쓰고, `bg.elevated`, `text.onBrand`, `status.danger`를 추가한다(값은 `spec.md`)
  - 기존 `export const Colors`는 `lightColors`를 가리키게 남겨서 116개 파일이 그대로 동작하게 한다. `@deprecated`를 달고 `useTheme()`을 안내한다
  - 중복 키(`divider.default`, `badge.red`, `icon.primary`)는 `@deprecated` JSDoc을 달고 대체 키를 명시한다
  - 결정: `icon.primary`의 유일한 사용처인 `src/components/Profile/Profile.tsx` 인증 뱃지는 `brand.primary`로 바꾼다. Phase 1에서 화면이 바뀌는 유일한 예외다(사용자 결정, 시안 B안)
  - 결정: spec 다크 표에 없는 `icon.red`·`icon.green`은 라이트 값을 그대로 쓴다(다크 배경에서도 대비가 충분한 중간 채도 색이라 별도 값이 불필요). 폐기 예정 키의 다크 값은 대체 키와 같게 둔다
- [x] 타이포그래피 토큰을 theme으로 이동하고 텍스트 프리셋 추가 (`src/theme/Typography.ts`, `src/constants/Typography.ts`)
  - 재사용: 현재 `FontSizes`, `FontWeights`, `LineHeights`, `LetterSpacing`
  - 결정: `git mv`로 파일을 옮겨 이력을 유지하고, variant별 기본 굵기는 `TextVariants.{variant}.defaultWeight`에 둔다
  - 패턴: `src/constants/Typography.ts`는 `export * from '@/theme/Typography'`만 남겨서 70개 import를 이번 Phase에서 건드리지 않는다
  - `TextVariants`(display/title/heading/body1/body2/caption/micro)는 `spec.md`의 표를 따른다
- [x] Spacing·Radius·Shadow 정리 (`src/theme/Spacing.ts`, `src/theme/BorderRadius.ts`, `src/theme/Shadow.ts`)
  - 패턴: 리터럴 분포가 16(89건), 8(65), 12(53), 24(43), 4·6(각 30)으로 기존 스케일(2/4/8/12/16/20/24/32)과 대부분 일치하므로 스케일은 유지한다. 스케일 밖 값은 spec의 "스케일 밖 값" 규칙으로 처리한다
  - `Shadow`에 `lg`(모달·바텀시트용) 추가
- [x] theme 진입점 정리 (`src/theme/index.ts`)
  - 패턴: 현재는 `Color`만 export한다. Palette·Typography·Spacing·BorderRadius·Shadow를 모두 export한다
- [x] 토큰 무결성 테스트 (`src/__tests__/theme/tokens.test.ts`)
  - 패턴: 기존 unit 프로젝트(`jest.config.js`의 `src/__tests__/**/*.test.ts`)
  - 검증: `lightColors`와 `darkColors`의 키 구조가 같음, light 값이 재정비 전 hex와 같음(인증 뱃지 제외), 모든 `TextVariants`의 lineHeight ≥ fontSize, semantic 값이 전부 Palette 값 중 하나

## Phase 2: 테마 인프라

- [x] `ThemeProvider`와 `useTheme` (`src/theme/ThemeProvider.tsx`)
  - react-native `useColorScheme()`으로 기기 설정을 읽고 `{ scheme, colors }`를 Context로 내려준다. `DARK_MODE_ENABLED`가 `false`이면 항상 `light`를 내려준다
  - 패턴: 별도 스토어를 만들지 않는다. Zustand는 서버·도메인 상태용이고(`agent_docs/architecture.md`), 테마는 기기 설정에서 파생되는 값이라 Context로 충분하다
- [x] `useThemedStyles` 훅 (`src/theme/useThemedStyles.ts`)
  - `makeStyles: (theme) => StyleSheet.create(...)`를 받아 `useMemo`로 scheme마다 한 번만 만든다
  - 이 훅의 사용법이 104개 파일 마이그레이션의 레시피가 되므로, 레시피를 `agent_docs/design-system.md` 초안에 바로 적는다(Phase 5에서 문서 완성)
- [x] 앱 루트 연결 (`App.tsx`)
  - `ThemeProvider`를 `ErrorBoundary` 바로 안쪽에 둔다. `NavigationContainer`에 scheme에 맞는 `theme`(React Navigation `DefaultTheme`/`DarkTheme`을 우리 토큰으로 덮어쓴 값)을 넘긴다
  - `expo-status-bar`의 `StatusBar`를 scheme에 맞춰 렌더링한다(현재 사용처 없음)
  - 결정: 라이트는 React Navigation `DefaultTheme`을 그대로 쓰고 다크만 토큰으로 덮어쓴다(`src/theme/navigationTheme.ts`). 라이트까지 덮어쓰면 화면 배경(`#F2F2F2`→흰색)과 헤더 테두리 색이 바뀌어 "중간 배포 시 화면 동일" 결정과 충돌한다
  - 결정: `useTheme`을 쓰기 위해 `AppContent`의 `ErrorBoundary` 안쪽을 `ThemedAppContent` 컴포넌트로 분리했다
  - 결정: `ErrorBoundary`는 `ThemeProvider` 바깥이고 클래스 컴포넌트라 훅을 못 쓴다. fallback 화면만 `lightColors`로 고정한다(테마 컨텍스트가 깨졌을 수도 있는 에러 화면이므로 단순하게 유지)
- [x] 테마 인프라 테스트 (`src/__tests__/theme/ThemeProvider.test.tsx`)
  - 패턴: `src/__tests__/components/EditProfileModal.test.tsx`의 react-test-renderer 사용 방식
  - 결정: 플래그는 상수라 테스트에서 바꿀 수 없으므로, "켜져 있으면 기기 설정을 따름"은 순수 함수 `resolveThemeScheme`으로 검증한다
  - 검증: 플래그가 꺼져 있으면 기기가 다크여도 light, 켜져 있으면 기기 설정을 따름, 같은 scheme에서 `useThemedStyles`가 같은 객체를 반환함

## Phase 3: 공통 Text 컴포넌트

- [x] `Text` 컴포넌트 (`src/components/ui/Text.tsx`)
  - 패턴: 참고 프로젝트 `components/ui/text.tsx`처럼 RN `Text`를 감싸되, `variant`·`weight`·`color` prop을 받아 `TextVariants`와 `useTheme().colors.text`로 스타일을 만든다. `style` prop은 마지막에 병합한다
  - 재사용: `HighlightMatchText.tsx`가 중첩 `Text`를 쓰므로 중첩 시 부모 스타일 상속이 깨지지 않는지 확인
  - 결정: 중첩 여부는 자체 Context로 판단하고, variant 없는 중첩 `Text`는 크기·행간뿐 아니라 굵기·색도 지정한 prop이 없으면 넣지 않는다(기본 색 `text.primary`가 부모 색을 덮어쓰는 문제 방지). props 타입은 기존 관례대로 `src/types/components.ts`의 `TextProps`
- [x] `Text` 단위 테스트 (`src/__tests__/components/Text.test.tsx`)
  - 검증: variant별 스타일, light/dark 색, 중첩 상속, `style` 우선

## Phase 4: 핵심 컴포넌트 API 표준화

- [ ] `Button` 재작성 (`src/components/ui/Button.tsx`, `src/types/components.ts`)
  - 재사용: 기존 `memo`, `testID`, `flex`, `style` prop 지원
  - 패턴: 참고 프로젝트 `components/ui/button.tsx`의 `variant`·`size`·`isLoading`·disabled 처리 구조. 피드백은 `TouchableOpacity` 대신 `Pressable`의 pressed 상태로 처리. 색은 `useThemedStyles`로 만든다
  - API와 기존 값 매핑은 `spec.md`의 Button 절을 따른다
  - 결정: padding 기반 높이를 고정 높이 sm 32 / md 40 / lg 52로 바꾼다. `lg` 6곳은 약 3px 커지고 `md2`·`lg2`는 약 1px 작아진다(사용자 결정, 시안 비교 후 수락)
- [ ] Button 호출부 마이그레이션 (`src/screens/AgreeToTermsAndConditions.tsx`, `Onboarding.tsx`, `SignUpDisplayName.tsx`, `DeleteAccount.tsx`, `SignUpIslandName.tsx`, `NewPost.tsx`, `src/components/ui/UpdateModal.tsx`, `src/components/PostDetail/ReportModal.tsx`, `EditCommentModal.tsx`, `src/components/Profile/EditProfileModal.tsx`, `src/components/NewPost/BulkAddItem/Review.tsx`, `src/components/Block/BlockedUserUnit.tsx`)
  - 패턴: `src/__tests__/components/EditProfileModal.test.tsx`는 `Button`을 문자열로 mock하므로 prop 이름 변경의 영향을 받지 않는다
- [ ] `Badge`를 tone 기반으로 재작성 (`src/components/ui/Badge.tsx`, `src/components/Home/MarketTypeBadge.tsx`, `src/components/Community/CommunityTypeBadge.tsx`)
  - 재사용: `colors.text.{tone}`·`colors.bg.{tone}` 쌍이 이미 tone별로 짝지어져 있다
- [ ] `Divider` 컴포넌트 추가 (`src/components/ui/Divider.tsx`)
  - 재사용: `colors.border.default`, `SECTION_DIVIDER_HEIGHT`(현재 사용처 0)
- [ ] 입력 에러 색상 토큰화 (`src/components/ui/inputs/ValidationInput.tsx`)
  - 현재 `borderColor: 'red'` 리터럴 → `colors.status.error`

## Phase 5: 가드레일과 문서

- [ ] ESLint 규칙 추가 (`.eslintrc.js`)
  - `no-restricted-imports`: react-native의 `Text` import와 `@/theme`의 정적 `Colors` import를 `warn`으로 표시하고 대체 방법을 안내한다
  - `no-restricted-syntax`: `src/theme/` 밖의 hex 문자열 리터럴과 `'white'`·`'black'`·`'red'` 색 리터럴을 `warn`으로 표시한다
  - 패턴: 참고 프로젝트 AGENTS.md의 "react-native 기본 컴포넌트 직접 import 금지" 규칙. `npm run lint`에 `--max-warnings`가 없으므로 경고는 CI를 막지 않는다
- [ ] 디자인 시스템 문서 (`agent_docs/design-system.md`)
  - 토큰 표, 컴포넌트 API, 마이그레이션 레시피, 서드파티 style prop 처리법, "새 컴포넌트를 `ui/`로 올리는 기준", 스케일 밖 값 규칙, 도메인별 마이그레이션 현황 표
- [ ] CLAUDE.md 세부 문서 표에 `design-system.md` 행 추가 (`CLAUDE.md`)

## Phase 6: 공통 UI와 내비게이션 마이그레이션

Phase 6~10은 같은 레시피를 반복한다. 각 파일에서 (1) `Colors` → `useThemedStyles`/`useTheme`, (2) RN `Text` → 공통 `Text`, (3) 간격·모서리 리터럴 → 토큰, (4) hex·색 이름 리터럴 → semantic 토큰으로 바꾼다. Phase마다 라이트 화면이 이전과 같은지, 플래그를 임시로 켰을 때 다크 화면이 깨지지 않는지 확인한다.

- [ ] `src/components/ui/` 25개 파일 (`layout/`, `inputs/`, `loading/`, `skeleton/`, `CustomBottomSheet.tsx`, `Toast.tsx`, `SocialLoginButton.tsx`, `ImageViewerModal.tsx` 등)
  - 주의: `CustomBottomSheet.tsx`의 `backgroundStyle`·`handleIndicatorStyle`처럼 `style`이 아닌 prop도 훅에서 만든 스타일을 넘긴다
  - hex 4건(`SkeletonBox`, `Toast`, `SocialLoginButton`)을 여기서 제거한다
- [ ] 내비게이션 3개 파일 (`src/navigation/RootStackNavigator.tsx`, `ProfileStackNavigator.tsx`, `MainTabNavigator.tsx`)
  - `headerTintColor`, `tabBarStyle`, `tabBarActiveTintColor`를 `useTheme()`에서 읽는다
- [ ] `src/components/PageIndicator.tsx`

## Phase 7: 도메인 마이그레이션 1 (소규모 도메인)

- [ ] Home 5개 파일 (`src/components/Home/*`, `src/screens/Home.tsx`)
  - `NativeAdUnit.tsx`의 hex 1건 제거. 광고 소재 자체의 색은 바꾸지 않는다
- [ ] Search 3개, Community 1개, Block 1개, Onboarding 1개 파일 (`src/components/Search/*`, `src/components/Community/*`, `src/components/Block/*`, `src/components/Onboarding/*`)

## Phase 8: 도메인 마이그레이션 2 (NewPost)

- [ ] NewPost 19개 파일 (`src/components/NewPost/**`)
  - `BulkAddItem/` 하위의 배너·리뷰 그룹은 tone 색을 쓰므로 Badge와 같은 tone 쌍 규칙을 따른다

## Phase 9: 도메인 마이그레이션 3 (Chat)

- [ ] Chat 12개 파일 (`src/components/Chat/**`)
  - 주의: `react-native-gifted-chat`의 `containerStyle`, `wrapperStyle`, renderer 함수 안의 색은 모두 `useTheme()`에서 읽는다. renderer가 컴포넌트 밖 함수라면 컴포넌트 안으로 옮기거나 colors를 인자로 넘긴다
  - 보낸 말풍선(`brand.primary` 배경 + 흰 글자)은 다크에서도 같은 색을 쓴다

## Phase 10: 도메인 마이그레이션 4 (PostDetail, Profile, Notice, screens)

- [ ] PostDetail 11개 파일 (`src/components/PostDetail/**`)
- [ ] Profile 8개 파일 (`src/components/Profile/**`)
- [ ] Notice 7개 파일 (`src/components/Notice/**`, `src/screens/Notice.tsx`의 탭바 스타일 포함)
- [ ] screens 18개 파일 (`src/screens/*`)
  - `PrivacyPolicy.tsx`, `TermsOfService.tsx`의 `'#333'` 6건을 `colors.text.secondary`로 바꾼다
  - `ErrorBoundary.tsx`는 Phase 2 결정대로 `lightColors`로 고정한다

## Phase 11: 다크 모드 활성화

- [ ] 남은 위반 확인 — `npm run lint` 경고 중 정적 `Colors` import, RN `Text` import, 색 리터럴이 0건인지 확인하고, 남은 것을 처리한다
- [ ] 플래그 켜기 (`src/theme/ThemeProvider.tsx`) — `DARK_MODE_ENABLED = true`
- [ ] 정적 `Colors` export와 폐기 예정 키 삭제 (`src/theme/Color.ts`), `src/constants/Typography.ts` re-export 삭제 후 import 경로 일괄 변경
- [ ] ESLint 규칙을 `warn`에서 `error`로 올림 (`.eslintrc.js`)
- [ ] 실기기 QA 체크리스트 작성과 수행 (`docs/design-system/plans/dark-mode-qa.md`) — `spec.md`의 화면 흐름과 엣지 케이스를 화면별로 확인

## 진행 기록

### 2026-11-11

- 시안: https://claude.ai/artifact/RBSR356wP9H6mG5wnwAZRJ (민트 정리안, 버튼 높이 전후 비교, variant·상태, 다크 팔레트)
- 결정: 주 버튼(흰 글자 on `#35d8c9`)의 대비가 1.78 : 1로 접근성 기준(3 : 1)에 못 미치지만, 브랜드 색 조정은 이번 범위에서 빼고 별도 작업으로 다룬다
- Phase 1 완료
- 검증: `npx jest --selectProjects unit` 6개 스위트 37개 통과, `npm run typecheck` 통과, 변경 파일 `eslint` 통과
- Phase 2 완료
- 검증: `npx jest --selectProjects unit` 7개 스위트 42개 통과, `npm run typecheck` 통과, 변경 파일 `eslint` 통과
- 결정: RN 0.83의 `useColorScheme()`은 설정 값이 없을 때 `null`이 아니라 `'unspecified'`를 반환하므로 spec 상태 정의를 고쳤다
- Phase 3 완료
- 검증: `npx jest --selectProjects unit` 8개 스위트 49개 통과, `npm run typecheck` 통과, 변경 파일 `eslint` 통과

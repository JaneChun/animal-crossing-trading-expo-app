# 디자인 시스템

색·글자·간격 토큰과 공통 UI 컴포넌트의 사용 규칙. 값 자체는 코드(`src/theme/`)가 기준이고, 이 문서는 어떤 토큰을 언제 쓰는지만 정한다. 다크 색상 값과 결정 배경은 `docs/design-system/plans/spec.md` 참조.

## 테마 구조

- 앱 코드는 모든 토큰을 `@/theme`에서 import한다. `@/constants/Typography`는 하위 호환용 re-export다.
- `src/theme/ThemeProvider.tsx` — 기기 설정(`useColorScheme`)을 읽어 `{ scheme, colors }`를 Context로 내려준다. `DARK_MODE_ENABLED`가 `false`이면 항상 `light`다.
- `ThemeProvider`는 `App.tsx`의 `ErrorBoundary` 바로 안쪽에 있다. 그래서 `ErrorBoundary` fallback 화면은 테마를 쓰지 못하고 `lightColors`로 고정된다.
- React Navigation 테마는 `src/theme/navigationTheme.ts`가 정한다. 라이트는 기본 테마(`DefaultTheme`)를 그대로 쓰고 다크만 토큰으로 덮어쓴다. 라이트까지 덮어쓰면 화면 배경과 헤더 테두리 색이 바뀐다.

## 토큰

| 파일 | 내용 | 화면 코드에서 |
| --- | --- | --- |
| `palette.ts` | `Palette` — 색 이름 + 단계(primitive) | 직접 쓰지 않는다 |
| `Color.ts` | `lightColors`·`darkColors` — 용도별 이름(semantic) | `useTheme().colors` 또는 `useThemedStyles`로 읽는다 |
| `Typography.ts` | `TextVariants`, `FontSizes`, `FontWeights`, `LineHeights` | 공통 `Text`의 `variant`·`weight`로 쓴다 |
| `Spacing.ts` | `Spacing`(2/4/8/12/16/20/24/32), `SCREEN_PADDING`(16) | padding·margin·gap |
| `BorderRadius.ts` | `xs` 4 / `s` 8 / `m` 12 / `l` 16 / `xl` 20 / `full` | 원형은 `full` |
| `Shadow.ts` | `sm` 카드 / `md` 플로팅 버튼·드롭다운 / `lg` 모달·바텀시트 | |

색 선택 규칙:

- tone 색(red/orange/yellow/green/blue/lavender/purple)은 `text.{tone}`과 `bg.{tone}`을 반드시 쌍으로 쓴다.
- 민트 면(주 버튼, 보낸 말풍선) 위의 글자는 `text.onBrand`(두 테마 모두 흰색)다. `text.inverse`는 테마의 반대색이라 다크에서 어두워진다.
- 화면 위에 떠 있는 면(바텀시트·모달·토스트)의 배경은 `bg.elevated`다. 다크에서는 그림자가 보이지 않아서 이 색으로 층을 구분한다.
- 폐기 예정 키: `divider.default` → `border.default`, `badge.red` → `status.danger`, `icon.primary` → `brand.primary`.

**스케일 밖 값**: 6·10·14·18처럼 `Spacing`에 없는 값은 인접 토큰으로 바꿨을 때 화면 차이가 2px 이하이면 토큰으로 바꾸고, 그보다 크거나 정렬이 깨지면 리터럴로 남긴다. 스케일에 값을 새로 추가하지 않는다. `borderRadius: 50`처럼 "반지름 = 크기의 절반" 리터럴은 `full`로 바꾼다.

## 공통 컴포넌트

### Text (`@/components/ui/Text`)

| prop | 값 | 기본값 |
| --- | --- | --- |
| `variant` | `display` 24 / `title` 20 / `heading` 18 / `body1` 16 / `body2` 14 / `caption` 12 / `micro` 10 | `body1` |
| `weight` | `FontWeights`의 키 | variant의 기본 굵기 |
| `color` | `colors.text`의 키 | `primary` |

- `style`은 마지막에 병합되어 가장 우선한다. 임의 색은 `style`로만 넘긴다.
- 다른 공통 `Text` 안에 중첩된 `Text`는 지정하지 않은 크기·굵기·색을 부모에게서 상속한다. RN `Text` 안에 넣으면 중첩으로 인식하지 않아 기본 색이 부모 색을 덮어쓴다.

### Button (`@/components/ui/Button`)

| prop | 값 | 기본값 |
| --- | --- | --- |
| `variant` | `primary` 민트 면 / `outline` 민트 테두리 / `secondary` 회색 테두리 / `danger` 빨간 면 / `dangerOutline` 빨간 테두리 / `ghost` 글자만 | `primary` |
| `size` | `sm` 32 / `md` 40 / `lg` 52 (고정 높이) | `md` |
| `isLoading` | 글자 자리에 스피너. 너비 유지, `onPress` 막힘 | `false` |
| `leftIcon` | ReactNode | — |
| `children` | 문자열만. 한 줄로 표시되고 넘치면 말줄임 | 필수 |

`disabled`이면 variant와 관계없이 회색 면 + `text.tertiary` 글자다.

### Badge (`@/components/ui/Badge`)

`tone`(`red`·`orange`·`yellow`·`green`·`blue`·`lavender`·`purple`·`brand`·`neutral`)으로 글자·배경 쌍을 정한다. 바깥 여백이 없으므로 옆 요소와의 간격은 호출부 레이아웃(`gap` 등)이 정한다.

### Divider (`@/components/ui/Divider`)

`variant="thin"`(높이 1, 리스트 구분)과 `variant="section"`(높이 8, 섹션 구분).

### 새 컴포넌트를 `ui/`로 올리는 기준

- 서로 다른 도메인 두 곳 이상에서 같은 모양으로 쓰일 때 올린다. 한 도메인 안에서만 반복되면 그 도메인 폴더에 둔다.
- 올릴 때 색을 prop으로 받지 않는다. 모양 차이는 `variant`·`tone`·`size` 같은 의미 있는 이름으로 표현한다.

## 마이그레이션 레시피

정적 `Colors`를 모듈 최상단 `StyleSheet.create`에서 읽으면 import 시점에 값이 고정되어 테마가 바뀌어도 화면이 그대로다. 파일마다 (1) `Colors` → `useThemedStyles`/`useTheme`, (2) RN `Text` → 공통 `Text`, (3) 간격·모서리 리터럴 → 토큰, (4) hex·색 이름 리터럴 → semantic 토큰 순서로 바꾼다.

```tsx
// 전
import { Colors } from '@/theme/Color';

const Foo = () => <View style={styles.container} />;

const styles = StyleSheet.create({
	container: { backgroundColor: Colors.bg.primary },
});

// 후
import { Theme, useThemedStyles } from '@/theme';

const Foo = () => {
	const styles = useThemedStyles(makeStyles);
	return <View style={styles.container} />;
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: { backgroundColor: colors.bg.primary },
	});
```

- `makeStyles`는 반드시 컴포넌트 밖에 둔다. 컴포넌트 안에서 만들면 렌더마다 함수가 새로 생겨 스타일도 매번 다시 만들어진다.
- JSX prop에 색을 직접 넘기는 곳(`color={Colors.icon.default}`, `placeholderTextColor` 등)은 `const { colors } = useTheme()`으로 읽는다.
- `StyleSheet.create`를 `makeStyles`로 감싸면 안쪽 들여쓰기가 한 단계 깊어진다. ESLint는 Prettier 형식을 검사하지 않으므로(`eslint-config-prettier`만 사용) 바꾼 파일은 `npx prettier --write`로 정리한다. 원본부터 Prettier 형식이 아닌 파일은 `--range-start`/`--range-end`로 바꾼 블록만 정리해 관계없는 줄이 바뀌지 않게 한다.
- 마이그레이션 중 라이트 화면이 이전과 같은지 확인하고, `DARK_MODE_ENABLED`를 임시로 켜서 다크 화면이 깨지지 않는지 본다(커밋 전 다시 끈다).

### 서드파티 style prop

`style`이 아닌 스타일 prop도 훅에서 만든 값을 넘긴다. 모듈 최상단 상수로 두면 테마가 바뀌어도 갱신되지 않는다.

- `@gorhom/bottom-sheet`: `backgroundStyle`, `handleIndicatorStyle`
- React Navigation: `headerTintColor`, `tabBarStyle`, `tabBarActiveTintColor` 등 `screenOptions` 안의 색 → 네비게이터 컴포넌트 안에서 `useTheme()`으로 읽는다
- `react-native-gifted-chat`: `containerStyle`, `wrapperStyle`, renderer 함수 안의 색. renderer가 컴포넌트 밖 함수라면 컴포넌트 안으로 옮기거나 `colors`를 인자로 넘긴다

## 가드레일 (`.eslintrc.js`)

`src/`와 `App.tsx`에서 아래를 `warn`으로 표시한다. `src/theme/`과 공통 `Text` 자체는 제외한다. `npm run lint`에 `--max-warnings`가 없으므로 경고는 CI를 막지 않는다. 다크 모드를 활성화할 때 `error`로 올린다.

- react-native의 `Text` import → 공통 `Text` 안내
- `@/theme/Color`·`@/theme`의 정적 `Colors` import → `useTheme()`·`useThemedStyles()` 안내
- hex 문자열 리터럴, 색 관련 prop(`color`·`backgroundColor` 등)의 `'white'`·`'black'`·`'red'` 리터럴. `'transparent'`는 허용

## 도메인별 마이그레이션 현황

가드레일 경고가 남은 파일 수(2026-11-12 기준). 0이 되면 해당 도메인 마이그레이션이 끝난 것이다.

| 도메인 | 남은 파일 | 계획 Phase |
| --- | --- | --- |
| `components/ui` | 25 | 6 |
| `navigation` + `PageIndicator.tsx` | 4 | 6 |
| `components/Home` | 4 | 7 |
| `components/Search`, `Block`, `Onboarding` | 5 | 7 |
| `components/NewPost` | 21 | 8 |
| `components/Chat` | 13 | 9 |
| `components/PostDetail` | 15 | 10 |
| `components/Profile` | 8 | 10 |
| `components/Notice` | 7 | 10 |
| `screens` | 18 | 10 |

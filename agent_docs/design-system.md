# 디자인 시스템

색·글자·간격 토큰과 공통 UI 컴포넌트의 사용 규칙. 값 자체는 코드(`src/theme/`)가 기준이고, 이 문서는 어떤 토큰을 언제 쓰는지만 정한다. 다크 색상 값과 결정 배경은 `docs/design-system/plans/spec.md` 참조.

## 테마 구조

- 앱 코드는 모든 토큰을 `@/theme`에서 import한다.
- `src/theme/ThemeProvider.tsx` — 기기 설정(`useColorScheme`)을 읽어 `{ scheme, colors }`를 Context로 내려준다. `DARK_MODE_ENABLED`(현재 `true`)를 `false`로 바꾸면 항상 `light`다.
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
- 바탕 위에 놓인 입력칸·칩·카드·강조 행의 면은 `bg.fill`이다. 바텀시트 안에서는 `CustomBottomSheet`의 `SheetThemeProvider`가 `bg.fill`을 한 단계 밝은 값(`bg.fillOnElevated`)으로 바꿔 주므로, 컴포넌트는 위치와 관계없이 `bg.fill`만 쓴다. `bg.fillOnElevated`는 `CustomBottomSheet`를 직접 렌더링하는 컴포넌트(`EditProfileModal`, `EditItemModal` 등)의 스타일에서만 쓴다. 이 컴포넌트의 `useThemedStyles`는 Provider 바깥에서 실행되어, 시트 안에 그려지는 요소라도 `bg.fill`이 화면 바탕용 값으로 나온다. `bg.secondary`를 면으로 쓰면 다크에서 바탕(`bg.primary`)과 거의 같고 시트(`bg.elevated`) 위에서는 오히려 어두워진다. 테두리를 면과 같은 색으로 숨길 때도 `bg.fill`을 쓰고, 면 안의 행 구분선은 `border.onFill`을 쓴다.
- `bg.secondary` 바탕(채팅 메시지 영역) 위에 올라온 면은 `bg.raised`다. 라이트에서는 흰색, 다크에서는 `bg.fillOnElevated`와 같은 색이다.

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

`tone`(`red`·`orange`·`yellow`·`green`·`blue`·`lavender`·`purple`·`brand`·`neutral`·`danger`)으로 글자·배경 쌍을 정한다. 바깥 여백이 없으므로 옆 요소와의 간격은 호출부 레이아웃(`gap` 등)이 정한다.

### Banner (`@/components/ui/Banner`)

아이콘 + 한 줄 문구의 둥근 안내 배너. `tone`은 `Badge`와 같은 값과 색 쌍을 쓰고, `icon`은 Feather 아이콘 이름이다. 바깥 여백이 없으므로 `containerStyle`로 호출부가 정한다.

- 일괄 등록 결과 머리말: `brand`(찾음)·`yellow`(재확인)·`red`(실패)
- 관리자에게만 보이는 게시글 상태(`PostDetail`): `danger`(작성자 삭제)·`yellow`(관리자 숨김·작성자 정지로 숨김)

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
- 바꾼 화면은 시뮬레이터의 라이트·다크 모드에서 모두 확인한다(`xcrun simctl ui <UDID> appearance dark`).

- 흰 실루엣 같은 장식 이미지를 테마 색으로 칠할 때 `react-native-fast-image`의 `tintColor`를 쓰지 않는다. iOS에서 `FFFastImageView makeImage:withTint:`가 `UIGraphicsBeginImageContextWithOptions` assertion으로 앱을 종료시킨다. 로컬 에셋은 RN `Image`의 `style.tintColor`를 쓴다(예: `components/Profile/Profile.tsx`의 섬 배경).

### 서드파티 style prop

`style`이 아닌 스타일 prop도 훅에서 만든 값을 넘긴다. 모듈 최상단 상수로 두면 테마가 바뀌어도 갱신되지 않는다.

- `@gorhom/bottom-sheet`: `backgroundStyle`, `handleIndicatorStyle`
- React Navigation: `headerTintColor`, `tabBarStyle`, `tabBarActiveTintColor` 등 `screenOptions` 안의 색 → 네비게이터 컴포넌트 안에서 `useTheme()`으로 읽는다
- `react-native-gifted-chat`: `containerStyle`, `wrapperStyle`, renderer 함수 안의 색. renderer가 컴포넌트 밖 함수라면 컴포넌트 안으로 옮기거나 `colors`를 인자로 넘긴다

## 가드레일 (`.eslintrc.js`)

`src/`와 `App.tsx`에서 아래를 `error`로 막는다. `src/theme/`과 공통 `Text` 자체는 제외한다. 정적 `Colors` export는 삭제되어 import하면 타입 에러가 난다.

- react-native의 `Text` import → 공통 `Text` 안내
- hex 문자열 리터럴, 색 관련 prop(`color`·`backgroundColor` 등)의 `'white'`·`'black'`·`'red'` 리터럴. `'transparent'`는 허용

## 도메인별 마이그레이션 현황

2026-11-13 기준 `src/`와 `App.tsx`의 가드레일 경고(RN `Text` import, 정적 `Colors` import, hex·색 이름 리터럴)는 0건이다. 새 경고가 생기면 위 레시피로 옮긴다. 예외는 `screens/ErrorBoundary.tsx` 하나로, `ThemeProvider` 바깥에서 렌더링되므로 `lightColors`를 직접 읽는다.

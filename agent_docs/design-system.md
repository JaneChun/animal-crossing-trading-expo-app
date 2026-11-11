# 디자인 시스템

> 초안. 토큰 표·컴포넌트 API·가드레일은 디자인 시스템 작업 Phase 5에서 채운다.

## 테마 구조

- `src/theme/ThemeProvider.tsx` — 기기 설정(`useColorScheme`)을 읽어 `{ scheme, colors }`를 Context로 내려준다. `DARK_MODE_ENABLED`가 `false`이면 항상 `light`다.
- `ThemeProvider`는 `App.tsx`의 `ErrorBoundary` 바로 안쪽에 있다. 그래서 `ErrorBoundary` fallback 화면은 테마를 쓰지 못하고 `lightColors`로 고정된다.
- React Navigation 테마는 `src/theme/navigationTheme.ts`가 정한다. 라이트는 기본 테마(`DefaultTheme`)를 그대로 쓰고 다크만 토큰으로 덮어쓴다. 라이트까지 덮어쓰면 화면 배경과 헤더 테두리 색이 바뀐다.

## 마이그레이션 레시피

정적 `Colors`를 모듈 최상단 `StyleSheet.create`에서 읽으면 import 시점에 값이 고정되어 테마가 바뀌어도 화면이 그대로다. 아래 순서로 바꾼다.

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
- `style`이 아닌 스타일 prop(`backgroundStyle`, `containerStyle`, `tabBarStyle` 등)도 같은 방법으로 훅에서 만든 값을 넘긴다.

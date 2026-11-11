# 디자인 시스템 구축 - 명세

## 토큰 계층

- 토큰은 두 단계로 나눈다.
  - **Palette (primitive)**: 색 이름과 단계만 가진다. 예: `Palette.mint[400]`, `Palette.gray[900]`. 화면 코드는 Palette를 직접 쓰지 않는다.
  - **Colors (semantic)**: 용도를 이름으로 가진다. 예: `Colors.text.primary`, `Colors.bg.secondary`, `Colors.status.error`. 화면 코드는 이 계층만 쓴다.
- 앱 코드는 모든 토큰을 `@/theme`에서 import한다. `@/constants/Typography`는 하위 호환용 re-export로만 남는다.
- 토큰 재정비(Phase 1)는 렌더링 결과를 바꾸지 않는다. semantic 키가 가리키는 hex 값은 재정비 전과 같아야 한다. 유일한 예외는 프로필 인증 뱃지 아이콘으로, `#3AECDB`에서 `#35d8c9`로 바뀐다.
- 라이트 회색 팔레트는 기존 값을 다음 단계에 둔다: `gray.0 #FFFFFF`, `gray.100 #F5F5F8`, `gray.200 #eff0f4`, `gray.300 #e1e1e1`, `gray.400 #bebed2`, `gray.500 #9797a0`, `gray.800 #262634`, `gray.900 #050512`. 다크 값은 아래 "다크 색상 값" 표를 따른다.
- 민트 팔레트는 두 단계다. `mint.400 #35d8c9`는 면(버튼 배경, 말풍선)과 활성 상태(탭, 체크, 선택 테두리)에 쓰고, `mint.600 #06A98A`는 연한 민트 배경(`#DBF6F1`) 위의 글자와 아이콘에 쓴다.

## 색상 규칙

- 의미가 같고 값도 같은 키는 하나로 수렴한다. 남는 키와 폐기 키는 다음과 같다.

| 폐기 예정 키 | 대체 키 |
| --- | --- |
| `Colors.divider.default` | `Colors.border.default` |
| `Colors.badge.red` | `Colors.status.danger` (신규, 값 `#ff3a30`) |
| `Colors.icon.primary` | `Colors.brand.primary` |

- 폐기 예정 키는 이번 작업에서 지우지 않는다. `@deprecated` 표시만 하고, 도메인 마이그레이션이 끝나면 삭제한다.
- tone 색상(red/orange/yellow/green/blue/lavender/purple)은 `Colors.text.{tone}`과 `Colors.bg.{tone}`을 반드시 쌍으로 쓴다. 글자색만 tone으로 바꾸고 배경을 다른 tone으로 쓰지 않는다.
- `text.onBrand`는 민트 면(주 버튼, 보낸 말풍선) 위의 글자색이고 두 테마 모두 흰색이다. `text.inverse`는 테마의 반대색이라 다크에서는 어두운 색이 된다. 기존 `text.inverse` 17곳 중 민트 면 위에 있는 것은 마이그레이션 때 `text.onBrand`로 바꾼다.
- `bg.elevated`는 바텀시트·모달·토스트처럼 화면 위에 떠 있는 면의 배경이다. 다크에서는 그림자가 보이지 않으므로 이 면을 `bg.primary`보다 밝게 해서 층을 구분한다.

## 테마와 다크 모드

### 화면 흐름

- 활성화 전(`DARK_MODE_ENABLED = false`): 기기 설정과 관계없이 앱 화면은 라이트로 그려진다. 지금과 같다.
- 활성화 후, 앱 실행 시: 기기 설정이 다크이면 첫 화면부터 다크로 그려진다. 라이트로 그렸다가 다크로 바뀌는 깜빡임이 없어야 한다.
- 활성화 후, 앱 사용 중 기기 설정 변경(제어 센터, 자동 전환 시각 도달): 현재 화면이 즉시 새 테마로 바뀐다. 스크롤 위치, 입력 중인 글자, 열린 바텀시트는 유지된다.
- 상태 바 글자색은 라이트에서 어둡게, 다크에서 밝게 바뀐다.
- Alert, ActionSheet, 키보드, 날짜 선택기 같은 네이티브 UI는 지금처럼 기기 설정을 따른다(`userInterfaceStyle: 'automatic'` 유지).
- 앱 안에는 테마 설정이 없다. 사용자는 기기 설정으로만 바꾼다.

### 상태 정의

| 상태 | 설명 |
| --- | --- |
| `light` | 플래그가 꺼져 있거나, 기기 설정이 라이트이거나, 기기가 설정 값을 주지 않을 때(`unspecified`) |
| `dark` | 플래그가 켜져 있고 기기 설정이 다크일 때 |

### 다크 색상 값

라이트 값은 현재 값 그대로다. 다크 값은 시안 페이지에서 대비를 확인한 값이다.

| semantic 키 | 라이트 | 다크 | 다크 대비 |
| --- | --- | --- | --- |
| `bg.primary` | `#FFFFFF` | `#111118` | — |
| `bg.secondary` | `#F5F5F8` | `#1A1A23` | — |
| `bg.tertiary` | `#eff0f4` | `#24242E` | — |
| `bg.elevated` (신규) | `#FFFFFF` | `#1E1E27` | — |
| `bg.inverse` | `#000000` | `#FFFFFF` | — |
| `border.default` | `#eff0f4` | `#2C2C37` | — |
| `divider.thick` | `#e1e1e1` | `#3A3A46` | — |
| `text.primary` | `#050512` | `#F2F2F7` | 16.9 : 1 |
| `text.secondary` | `#262634` | `#C9C9D3` | 11.4 : 1 |
| `text.tertiary` | `#9797a0` | `#8C8C99` | 5.7 : 1 |
| `text.inverse` | `#FFFFFF` | `#050512` | — |
| `text.onBrand` (신규) | `#FFFFFF` | `#FFFFFF` | 라이트와 같음 |
| `icon.default` | `#bebed2` | `#5E5E6C` | 3.0 : 1 |
| `brand.primary` | `#35d8c9` | `#35d8c9` | 10.6 : 1 |
| `brand.secondary` | `#e6f8f5` | `#152B28` | — |
| `text.primaryBrand` | `#06A98A` | `#35d8c9` | 8.0 : 1 (민트 배경 위) |
| `bg.primaryBrand` | `#DBF6F1` | `#10302B` | — |
| `status.error` | `#E73B2A` | `#FF6B5E` | 6.7 : 1 |
| `status.success` | `#2dcd6f` | `#3DDC84` | — |
| `status.warning` | `#FFA500` | `#FFB340` | — |
| `status.danger` (신규) | `#ff3a30` | `#FF5A50` | — |
| `overlay.dim` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.6)` | — |
| `social.*` | 현재 값 | 라이트와 같음 | 각 사 브랜드 가이드 |

대비는 다크 `bg.primary` 기준이다. tone 쌍(red/orange/yellow/green/blue/lavender/purple)의 다크 값은 `src/theme/palette.ts`에 두며, 모든 쌍이 6 : 1 이상이다.

| tone | 다크 글자 | 다크 배경 |
| --- | --- | --- |
| red | `#F08A9C` | `#3B1E25` |
| orange | `#F2A06E` | `#3D2618` |
| yellow | `#E8C060` | `#362E17` |
| green | `#6FD07E` | `#18301C` |
| blue | `#7CC4DA` | `#14303A` |
| lavender | `#A3A3F5` | `#24243F` |
| purple | `#D88BEF` | `#33213B` |

## 타이포그래피

`TextVariants`는 크기와 행간만 정한다. 굵기는 `weight` prop으로 따로 정하며, 기본값은 variant마다 다르다.

| variant | fontSize | lineHeight | 기본 weight | 주 용도 |
| --- | --- | --- | --- | --- |
| `display` | 24 | 32 | bold | 화면 대표 제목(온보딩 등) |
| `title` | 20 | 28 | bold | 화면 제목, 모달 제목 |
| `heading` | 18 | 26 | semibold | 섹션 제목 |
| `body1` | 16 | 24 | regular | 본문 기본값 |
| `body2` | 14 | 20 | regular | 보조 본문, 리스트 부가 정보 |
| `caption` | 12 | 17 | regular | 시간, 메타 정보, 뱃지 |
| `micro` | 10 | 14 | medium | 탭 라벨, 카운트 |

- `Text`의 기본 variant는 `body1`, 기본 color는 현재 테마의 `text.primary`다.
- `color` prop은 `text`의 키(`'primary' | 'secondary' | 'tertiary' | 'inverse' | 'onBrand' | 'red' | …`)만 받고, 현재 테마의 값으로 바뀐다. 임의 색은 `style`로만 넘길 수 있다.
- `style` prop은 variant 스타일 뒤에 병합되므로 `style`의 값이 이긴다.
- 중첩된 `Text`(예: `HighlightMatchText`의 강조 구간)는 variant를 지정하지 않으면 부모의 크기·행간·굵기를 상속한다. 이를 위해 자식 `Text`는 variant prop이 없을 때 fontSize·lineHeight를 스타일에 넣지 않고, `weight`·`color` prop이 없으면 굵기·색도 넣지 않는다. 색은 variant 지정 여부와 관계없이 `color` prop이 없으면 부모 색을 상속한다.
- 접근성 글자 크기 설정(`allowFontScaling`)은 지금 동작(RN 기본값, 확대 허용)을 그대로 둔다.

## 간격·모서리·그림자

- 간격은 `Spacing` 스케일(2/4/8/12/16/20/24/32)을 쓴다. 화면 좌우 여백은 `SCREEN_PADDING`(16)이다.
- **스케일 밖 값**: 6·10·14·18처럼 스케일에 없는 값을 만나면, 인접한 토큰으로 바꿔서 화면 차이가 2px 이하일 때는 토큰으로 바꾼다. 차이가 그보다 크거나 정렬이 깨지면 리터럴로 남긴다. 스케일에 값을 새로 추가하지 않는다.
- 모서리는 `BorderRadius`(4/8/12/16/20/full)를 쓴다. 원형은 `full`을 쓰고, `borderRadius: 50`, `25` 같은 "반지름 = 크기의 절반" 리터럴은 `full`로 바꾼다.
- 그림자는 `Shadow.sm`(카드), `Shadow.md`(플로팅 버튼·드롭다운), `Shadow.lg`(모달·바텀시트) 세 단계다.

## Button

### API

| prop | 값 | 기본값 |
| --- | --- | --- |
| `variant` | `'primary' \| 'outline' \| 'secondary' \| 'danger' \| 'dangerOutline' \| 'ghost'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `isLoading` | boolean | `false` |
| `disabled` | boolean | `false` |
| `leftIcon` | ReactNode | 없음 |
| `flex`, `style`, `testID`, `onPress` | 기존과 같음 | |
| `children` | string | 필수 |

### 기존 값 매핑

| 기존 `color` | 새 `variant` | 배경 / 테두리 / 글자 |
| --- | --- | --- |
| `mint` | `primary` | brand.primary / brand.primary / text.onBrand |
| `white` | `outline` | 투명 / brand.primary / brand.primary |
| `gray` | `secondary` | 투명 / border.default / text.primary |
| `red` | `danger` | status.danger / status.danger / text.onBrand |
| `redWhite` | `dangerOutline` | 투명 / status.danger / status.danger |
| (신규) | `ghost` | 투명 / 없음 / text.secondary |

| 기존 `size` | 새 `size` | 높이 | 좌우 padding | 글자 |
| --- | --- | --- | --- | --- |
| (사용처 없음) | `sm` | 32 | 12 | body2 semibold |
| `md2` | `md` | 40 | 16 | body1 bold |
| `lg`, `lg2` | `lg` | 52 | 16 | body1 bold |

기존 `sm`, `md`는 호출부가 없으므로 매핑하지 않고 삭제한다.

### 상태

| 상태 | 설명 |
| --- | --- |
| 기본 | variant 표의 색 |
| pressed | 누르는 동안 불투명도 0.7 (기존 `TouchableOpacity` 기본값 0.2보다 덜 흐리게) |
| disabled | variant와 관계없이 배경·테두리 `border.default`, 글자 `text.tertiary`. `onPress`가 호출되지 않는다 |
| loading | 글자 대신 `ActivityIndicator`(글자색과 같은 색)를 표시한다. 버튼의 높이·너비는 로딩 전과 같다. `onPress`가 호출되지 않는다 |

## Badge

- `tone` prop(`'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'lavender' | 'purple' | 'brand' | 'neutral'`)을 받아 `Colors.text.{tone}` 글자와 `Colors.bg.{tone}` 배경을 쓴다. `brand`는 `primaryBrand` 쌍, `neutral`은 `tertiary` 쌍이다('거래완료', '자유' 배지).
- 글자는 `caption` semibold, padding은 세로 4 / 가로 6, 모서리는 `BorderRadius.xs`다.
- 기존 `textColor`·`bgColor` prop은 제거한다. 호출부(`MarketTypeBadge`, `CommunityTypeBadge`)는 타입별 tone 매핑으로 바꾼다.
- 기존 Badge에 있던 `marginRight: 6`은 컴포넌트에서 빼고, 간격은 호출부의 레이아웃이 정한다.

## Divider

- `variant="thin"`: 높이 1, `Colors.border.default`. 리스트 아이템 구분용이다.
- `variant="section"`: 높이 `SECTION_DIVIDER_HEIGHT`(8), `Colors.bg.secondary`. 섹션 구분용이다.

## ESLint 가드레일

- react-native에서 `Text`를 import하면 경고가 표시되고, 메시지로 `@/components/ui/Text`를 안내한다.
- `@/theme`에서 정적 `Colors`를 import하면 경고가 표시되고, 메시지로 `useTheme()`·`useThemedStyles()`를 안내한다.
- `src/theme/` 밖에서 hex 문자열 리터럴이나 `'white'`·`'black'`·`'red'` 같은 색 이름 리터럴을 쓰면 경고가 표시된다. `'transparent'`는 허용한다.
- 모든 규칙은 기존 위반이 남아 있으므로 `warn`이다. 다크 모드를 활성화하는 Phase에서 `error`로 올린다.
- 경고는 `npm run lint`의 종료 코드에 영향을 주지 않으므로 CI와 lint-staged는 기존처럼 통과한다.

## 엣지 케이스

- **Button에 긴 글자**: 한 줄로 표시하고 넘치면 말줄임(`numberOfLines={1}`) 처리한다. 버튼 높이는 늘어나지 않는다.
- **Button의 `flex`와 `style.width`를 함께 지정**: `style`이 마지막에 병합되므로 `style`이 이긴다.
- **disabled이면서 loading**: loading 표시를 우선하되 색은 disabled 색을 쓴다.
- **Text에 `color`와 `style.color`를 함께 지정**: `style.color`가 이긴다.
- **Badge에 정의되지 않은 tone**: tone `brand`로 표시한다. `MarketTypeBadge`·`CommunityTypeBadge`에 매핑에 없는 타입이 들어오면 표시할 라벨이 없으므로 지금처럼 배지를 렌더링하지 않는다.
- **폐기 예정 색상 키 사용**: 기존 화면은 계속 같은 색으로 렌더링된다. 편집기에서 취소선과 대체 키 안내가 보인다.
- **다크에서 흰 배경이 들어간 이미지**(아이템·주민 이미지, 업로드 사진): 이미지는 바꾸지 않는다. 썸네일 컨테이너는 `bg.secondary` 배경과 모서리를 유지해서 이미지가 화면에 떠 보이지 않게 한다.
- **광고(`NativeAdUnit`)**: 광고 소재의 이미지·문구 색은 바꾸지 않는다. 광고를 감싼 카드의 배경·테두리·"광고" 라벨만 테마를 따른다.
- **스플래시 화면**: `splash_image.jpg`는 흰 배경 이미지라서 다크 기기에서도 흰 스플래시가 잠깐 보인 뒤 다크 첫 화면으로 넘어간다. 이번 범위에서는 이 동작을 허용한다.
- **에러 화면(`ErrorBoundary`)**: 다크 기기에서도 라이트로 표시된다.
- **테마 전환 중 애니메이션**: 전환은 즉시 일어나며 별도의 색 전환 애니메이션은 없다.

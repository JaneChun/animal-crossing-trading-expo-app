# Expo SDK 52 → 54 업그레이드 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expo SDK 54(RN 0.81, React 19.1)로 업그레이드하여 Apple의 iOS 26 SDK(Xcode 26) 제출 요구사항(오류 90725)을 해소하고 1.9.0을 App Store Connect에 업로드한다.

**Architecture:** CNG(Continuous Native Generation) 구조이므로 네이티브 프로젝트는 EAS/로컬 prebuild가 재생성한다. 핵심 리스크는 ① React 19 타입/피어 의존성, ② SDK 53부터 기본 활성화된 Metro package exports와 Firebase JS SDK v10의 비호환, ③ Reanimated 4 전환에 따른 서드파티 호환성이다. 52→54 직행하되, 각 Task마다 정적 검증(typecheck/lint/test) 게이트를 둔다.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19.1, Reanimated 4 + react-native-worklets, EAS Build(기본 이미지 = Xcode 26)

## Global Constraints

- **커밋은 사용자가 직접 수행** — 에이전트는 커밋 지점과 메시지만 제안한다. AI 출처 표기 금지.
- Apple 요구사항: iOS 26 SDK(Xcode 26) 빌드 필수. SDK 54의 EAS 기본 이미지가 Xcode 26이므로 `eas.json`에 `image`를 지정하지 않는다(다음 해 정책 변경 시 자동 추종).
- 로컬 개발: SDK 54 최소 Xcode 16.1, Node 20.19.4+ (로컬 Node v22.13.0 확인됨).
- Firebase JS SDK는 **v10 유지** — 이번 업그레이드에서 v12로 올리지 않는다(변경 반경 최소화). 대신 Metro package exports를 끈다.
- `firebase` iOS 빌드 제약으로 `useFrameworks: 'static'` 유지 — 이 때문에 SDK 54의 "precompiled React Native"는 적용되지 않고 소스 빌드된다(빌드 시간만 증가, 동작 무관).
- New Architecture는 이미 활성화 상태(`newArchEnabled: true`) — Reanimated 4 요구사항 충족.
- 앱 버전 1.9.0 유지, 빌드 번호는 EAS `autoIncrement`.
- 문서-코드 불일치 발생 시 CLAUDE.md·agent_docs 갱신(Task 7).

## 사전 결정 사항 (계획 승인 시 확정)

1. **`expo-router` 제거 여부**: `~4.0.17`이 의존성에 있으나 코드에서 미사용(main은 `expo/AppEntry`, import 0건). 유지하면 SDK 54에서 v6으로 강제 범프되어 불필요한 마이그레이션 리스크. → **제거 권장** (`experiments.typedRoutes`도 함께 제거). 사용자 확인 필요.
2. **업그레이드 경로**: 52→54 직행. Expo 공식 커맨드(`npx expo install expo@^54.0.0 --fix`)가 지원하며, 실패 시 원인 격리를 위해 53 경유로 전환하는 fallback을 둔다.

---

### Task 1: 브랜치 생성 및 베이스라인 확보

**Files:**
- 없음 (git 작업만)

**Interfaces:**
- Produces: `chore/upgrade-expo-sdk-54` 브랜치, 업그레이드 전 검증 통과 기록

- [ ] **Step 1: master에서 새 브랜치 생성**

```bash
git checkout master && git pull && git checkout -b chore/upgrade-expo-sdk-54
```

주의: 현재 `feat/bulk-add-items`에 미커밋 변경(CLAUDE.md, .claude/, agent_docs/)이 있음 — 사용자에게 stash 또는 커밋 처리를 먼저 요청.

- [ ] **Step 2: 베이스라인 검증 실행**

```bash
npm ci && npm run typecheck && npm run lint && npx jest --selectProjects unit
```

Expected: 모두 통과. 실패 항목이 있으면 기록해두고 업그레이드 후 동일 실패는 이번 작업 무관으로 분류.

---

### Task 2: Expo SDK 54 코어 업그레이드

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Produces: expo ~54.x / react-native 0.81.x / react 19.1.0 / reanimated ~4.x + react-native-worklets 로 정렬된 의존성 트리

- [ ] **Step 1: Expo 코어 및 관리 대상 패키지 일괄 업그레이드**

```bash
npx expo install expo@^54.0.0 --fix
```

Expected: expo, react, react-native, 모든 `expo-*`, reanimated/gesture-handler/screens/safe-area-context/pager-view/webview/netinfo/async-storage 등이 SDK 54 호환 버전으로 변경됨.

- [ ] **Step 2: worklets 의존성 확인 (Reanimated 4 필수)**

```bash
npm ls react-native-worklets || npx expo install react-native-worklets
```

babel.config.js는 수정하지 않는다 — `babel-preset-expo`가 worklets 플러그인을 처리.

- [ ] **Step 3: devDependencies 수동 정렬**

```bash
npm install -D typescript@~5.9.2 @types/react@~19.1.0 jest-expo@~54.0.0 react-test-renderer@19.1.0 @types/react-test-renderer@^19
npm uninstall @types/react-native @types/react-native-snap-carousel
npm install -D @types/react-native-snap-carousel
```

`@types/react-native`(0.72)는 RN 내장 타입과 충돌하므로 **제거**(재설치 안 함). snap-carousel 타입은 dependencies에 잘못 들어가 있으므로 devDependencies로 이동.

- [ ] **Step 4: expo-router 제거 (사전 결정 1 승인 시)**

```bash
npm uninstall expo-router
```

`app.config.js`에서 `experiments.typedRoutes: true` 블록과 `extra.router` 블록 삭제:

```js
		experiments: {
			typedRoutes: true,
		},
```
→ 삭제

```js
		extra: {
			router: {
				origin: false,
			},
			eas: { ... },
		},
```
→ `extra.eas`만 남김.

- [ ] **Step 5: React 중복 설치 확인**

```bash
npm ls react react-dom
```

Expected: react 19.1.0 단일 버전. 중복(react 18 잔존)이 보이면 `package.json` `overrides`에 `"react": "19.1.0"` 추가 후 `npm install` 재실행.

- [ ] **Step 6: 앱 엔트리 확인**

```bash
ls node_modules/expo/AppEntry.js
```

Expected: 존재. 만약 없으면(제거된 경우) 루트에 `index.js` 생성:

```js
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

그리고 `package.json`의 `"main"`을 `"index.js"`로 변경.

- [ ] **Step 7: patch-package 적용 확인**

```bash
npm install 2>&1 | grep -A2 patch-package
```

Expected: `react-native-snap-carousel+3.9.1.patch` 적용 성공. 실패 시 patch 파일을 새 node_modules 기준으로 재생성(`npx patch-package react-native-snap-carousel`).

- [ ] **Step 8: expo-doctor 실행**

```bash
npx expo-doctor
```

Expected: 통과(경고는 기록). 버전 불일치 지적 시 `npx expo install --fix` 재실행.

- [ ] **Step 9: 커밋 지점 (사용자 수행)**

제안 메시지: `chore: Expo SDK 54 업그레이드 (RN 0.81, React 19.1)`

---

### Task 3: Metro package exports 비활성화 (Firebase JS SDK v10 호환)

**Files:**
- Create: `metro.config.js` (루트)

**Interfaces:**
- Consumes: Task 2의 SDK 54 의존성 트리
- Produces: Firebase v10이 SDK 53+ Metro에서 정상 해석되는 번들 설정

- [ ] **Step 1: metro.config.js 생성**

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK v10은 Metro의 package.json "exports" 해석(SDK 53+ 기본 활성화)과
// 비호환("Component auth has not been registered yet" 등). v12+ 업그레이드 전까지 비활성화.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
```

- [ ] **Step 2: 번들 스모크 테스트**

```bash
npx expo export --platform ios --output-dir /tmp/bundle-test 2>&1 | tail -5
```

Expected: 에러 없이 번들 생성. `@firebase/*` 해석 오류가 나오면 실패 — exports 설정이 적용되는지 확인.

- [ ] **Step 3: 커밋 지점 (사용자 수행)**

제안 메시지: `chore: Metro package exports 비활성화 (Firebase v10 호환)`

---

### Task 4: app.config.js 정리 및 서드파티 네이티브 라이브러리 정렬

**Files:**
- Modify: `app.config.js:48-59` (expo-build-properties 블록)
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 2 의존성 트리
- Produces: SDK 54 prebuild에서 경고/오류 없는 설정, RN 0.81 호환 서드파티 버전

- [ ] **Step 1: expo-build-properties에서 newArchEnabled 제거**

SDK 53+에서 New Architecture는 기본값이며 플러그인 옵션은 무효/경고 대상. `useFrameworks: 'static'`과 Kakao maven repo는 유지:

```js
			[
				'expo-build-properties',
				{
					android: {
						extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
					},
					ios: {
						useFrameworks: 'static',
					},
				},
			],
```

- [ ] **Step 2: Reanimated 4 의존 라이브러리 최신화**

```bash
npm install @gorhom/bottom-sheet@^5 react-native-keyboard-controller@^1
npm install react-native-google-mobile-ads@latest
```

lockfile이 구버전에 고정되어 있으므로 명시 재설치로 5.x/1.x 최신 마이너를 받는다. google-mobile-ads는 메이저가 오를 수 있음 — 오르면 changelog의 breaking changes를 확인하고 `app.config.js` 플러그인 옵션 호환 여부 점검.

- [ ] **Step 3: 그대로 두는 라이브러리 (리스크 항목으로 기록)**

- `react-native-fast-image` 8.6.3 — 유지보수 중단, New Arch interop으로 동작 중. Task 6 스모크 테스트에서 이미지 렌더링 확인. 문제 시 후속 과제로 expo-image 전환.
- `react-native-snap-carousel` 3.9.1(+patch) — Task 6에서 홈 캐러셀 확인.
- `react-native-gifted-chat` 2.8.1 — Task 6에서 채팅 화면 확인.
- `@react-native-firebase/*` v23, `@react-native-kakao/*` 2.2.6, `naver-login` 4.x — RN 0.81 호환 예상, 빌드·로그인 스모크로 검증.

- [ ] **Step 4: 커밋 지점 (사용자 수행)**

제안 메시지: `chore: SDK 54 대응 설정 정리 및 서드파티 버전 정렬`

---

### Task 5: 코드 수정 — 정적 검증 루프

**Files:**
- Modify: typecheck/lint가 지적하는 파일들 (예상 영역: `src/stores/push/`, `src/utilities/registerForPushNotificationsAsync.ts`, `src/components/Profile/PushNotificationToggle.tsx`, `src/hooks/shared/useAppLifecycle.ts`, @expo/vector-icons 사용처)

**Interfaces:**
- Consumes: Task 2~4의 의존성·설정
- Produces: typecheck/lint/unit 테스트 전체 통과

- [ ] **Step 1: typecheck 실행으로 실패 목록 확보**

```bash
npm run typecheck 2>&1 | head -60
```

Expected 오류 유형과 대응:
- **React 19 타입**: `JSX.Element` → `React.JSX.Element`, `useRef()` 인자 필수화(`useRef<T>(null)` 등), 암묵적 children prop 제거.
- **expo-notifications**: SDK 54에서 제거된 deprecated 함수 export(예: `removeNotificationSubscription`) → 구독 객체의 `.remove()` 호출로 교체.
- **@expo/vector-icons**: 아이콘 이름 변경/제거 → typecheck 오류 나는 이름을 새 이름으로 교체.

- [ ] **Step 2: 오류를 하나씩 수정하고 typecheck 재실행 (통과까지 반복)**

```bash
npm run typecheck
```

Expected: 오류 0건.

- [ ] **Step 3: lint 및 단위 테스트**

```bash
npm run lint && npx jest --selectProjects unit
```

Expected: 통과. jest 실패가 jest-expo 54 프리셋 변화(예: react-test-renderer 관련)라면 테스트 설정(`jest.config.js`)을 우선 의심.

- [ ] **Step 4: 커밋 지점 (사용자 수행)**

제안 메시지: `fix: React 19·SDK 54 API 변경 대응`

---

### Task 6: 로컬 iOS 빌드 및 스모크 테스트

**Files:**
- 없음 (검증만; ios/는 gitignored라 prebuild 산출물은 커밋 안 됨)

**Interfaces:**
- Consumes: Task 2~5 완료 상태
- Produces: 실기기/시뮬레이터에서 핵심 플로우 동작 확인

- [ ] **Step 1: 네이티브 프로젝트 재생성 및 로컬 빌드**

```bash
npx expo prebuild --clean -p ios && npm run ios
```

Expected: pod install 및 Xcode 빌드 성공(useFrameworks static이므로 소스 빌드 — 오래 걸림). 실패 시 오류 라이브러리를 특정해 해당 라이브러리 버전/이슈 확인 — 여기서 3회 이상 원인 불명 실패 시 53 경유 경로로 전환 검토.

- [ ] **Step 2: 스모크 테스트 체크리스트 (dev client에서 수동)**

- 로그인: 카카오 / 네이버 / 애플 각 1회
- 홈: 캐러셀(snap-carousel) 렌더·스와이프
- 게시글: 목록·상세 이미지(fast-image) 로딩
- 채팅: 채팅방 진입, 메시지 송수신, 키보드(keyboard-controller) 동작
- 바텀시트(@gorhom/bottom-sheet) 열기/닫기
- 푸시: 설정 토글(expo-notifications), 포그라운드 수신
- 광고(AdMob) 노출
- 스플래시 → 홈 전환(RootStackNavigator isAppInitializing 분기)

- [ ] **Step 3: Maestro E2E (가능 시)**

```bash
npm run test:e2e
```

Expected: 기존 통과 플로우 유지.

---

### Task 7: EAS 프로덕션 빌드 → 제출 → 문서 갱신

**Files:**
- Modify: `CLAUDE.md`(스택 라인), `agent_docs/commands.md`(함정 노트 갱신)

**Interfaces:**
- Consumes: Task 6 검증 완료
- Produces: App Store Connect 업로드 성공(오류 90725 해소), 최신화된 문서

- [ ] **Step 1: 프로덕션 빌드**

```bash
npm run build:ios
```

빌드 로그 상단에서 이미지가 Xcode 26 계열(`macos-tahoe-…-xcode-26.x`)인지 확인. Xcode 16.x면 중단하고 eas-cli 업데이트(`npm i -g eas-cli`) 후 재시도.

- [ ] **Step 2: 제출**

```bash
npm run deploy:app
```

Expected: App Store Connect 처리 완료, 오류 90725 미발생. (처리 완료까지 수 분 소요 — 메일/ASC에서 확인)

- [ ] **Step 3: 문서 갱신**

- `CLAUDE.md`: `React Native 0.76 + Expo SDK 52` → `React Native 0.81 + Expo SDK 54`
- `agent_docs/commands.md`의 iOS 제출 함정 노트에 "2026-07 SDK 54 업그레이드로 해소, 매년 4월 Apple SDK 요구 상향 → 봄마다 Expo SDK 업그레이드 필요" 추가
- Reanimated 4 / Metro exports off 등 이번에 발견한 함정은 해당 도메인 agent_docs에 기록

- [ ] **Step 4: 커밋 지점 (사용자 수행)**

제안 메시지: `docs: SDK 54 업그레이드 반영`

---

## 설계 근거 및 트레이드오프

| 결정 | 대안 | 근거 |
|------|------|------|
| 52→54 직행 | 53 경유 단계 업그레이드 | 최종 도달점이 같고 검증을 2회 반복하는 비용 절감. 단, 빌드 실패 원인 격리가 어려워지므로 Task 6에서 3회 이상 원인 불명 실패 시 53 경유로 전환하는 탈출구를 둠. |
| Firebase v10 유지 + Metro exports off | Firebase v12 업그레이드 | 이번 목표는 "제출 가능한 빌드"이며 Firebase 메이저 업그레이드는 인증·Firestore 전 영역 회귀 리스크. exports off는 Expo 공식 워크어라운드. 부채로 남음 — v12 업그레이드 시 metro.config.js 제거 가능. |
| SDK 54 (55~57 아님) | 최신 SDK | 마이그레이션 반경 최소화. 단 SDK 55부터 Legacy Arch 미지원·요구 Xcode 26.2+ 등 변화가 커서, 다음 업그레이드(늦어도 2027년 4월 전)를 미리 캘린더에 반영 필요. |
| fast-image/snap-carousel 유지 | expo-image 등으로 교체 | 스코프 통제. 둘 다 유지보수 중단 라이브러리로 New Arch 의무화(SDK 55)에서 깨질 가능성 높음 — 후속 과제로 명시. |

## 프로덕션 리스크 대비

- **롤백**: 실패 시 브랜치 폐기로 완전 복구(네이티브 디렉터리 gitignored, 원격 영향 없음).
- **제출 마감**: 1.9.0 심사 일정이 급하면 Task 6 스모크를 핵심 플로우(로그인·거래글·채팅)로 축소하고 나머지는 TestFlight에서 검증.
- **OTA 업데이트 미사용** 구조이므로 JS-네이티브 버전 불일치 리스크 없음.

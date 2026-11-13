# 전역 키보드 액세서리 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 앱의 모든 iOS 텍스트 입력 키보드 위에 완료 기능을 제공한다.

**Architecture:** 앱 루트의 `KeyboardProvider` 안에 `KeyboardExtender` 기반 전용 컴포넌트를 한 번 렌더링한다. iOS 네이티브 `inputAccessoryView`에 완료 버튼을 연결해 화면 콘텐츠를 덮지 않도록 한다.

**Tech Stack:** React Native 0.81.5, Expo SDK 54, `react-native-keyboard-controller` 1.18.5

## Global Constraints

- 기존 `App.tsx`의 스플래시 종료 변경을 보존한다.
- 기존 의존성을 사용하며 새 패키지를 설치하지 않는다.
- `완료` 버튼만 표시한다.
- 멀티라인 입력의 줄바꿈 동작을 변경하지 않는다.
- 커밋은 사용자가 직접 수행한다.

---

### Task 1: 전역 키보드 액세서리 적용

**Files:**
- Create: `src/components/ui/GlobalKeyboardAccessory.tsx`
- Create: `src/__tests__/components/GlobalKeyboardAccessory.test.tsx`
- Modify: `App.tsx`
- Modify: `agent_docs/architecture.md`

**Interfaces:**
- Consumes: `KeyboardProvider`, `KeyboardExtender`, `KeyboardController` from `react-native-keyboard-controller`
- Produces: 모든 iOS 네이티브 텍스트 입력에 연결되는 단일 완료 액세서리

- [x] **Step 1: 패키지 버전과 기존 루트 변경 확인**

Run:

```bash
npm ls react-native-keyboard-controller --depth=0
git diff -- App.tsx
```

Expected: `react-native-keyboard-controller@1.18.5`가 표시되고, 기존 스플래시 종료 변경이 확인된다.

- [x] **Step 2: Provider와 액세서리를 앱 루트에 추가**

`App.tsx`의 import에 다음을 추가한다.

```tsx
import { KeyboardProvider } from 'react-native-keyboard-controller';
```

`App`의 반환값을 다음 구조로 변경한다.

```tsx
<QueryClientProvider client={queryClient}>
	<KeyboardProvider preload={false}>
		<AppContent />
		<GlobalKeyboardAccessory />
	</KeyboardProvider>
</QueryClientProvider>
```

- [x] **Step 3: 정적 검증 실행**

Run:

```bash
npx eslint App.tsx
npm run typecheck
git diff --check -- App.tsx
```

Expected: 세 명령 모두 종료 코드 0이며 오류가 없다.

- [ ] **Step 4: 실제 기기 동작 검증**

Run:

```bash
npm run dev
```

Expected:

- 제목·본문·검색·채팅·숫자 입력에서 키보드 위에 완료가 표시된다.
- 완료는 포커스를 해제하고 키보드를 닫는다.
- 본문 입력의 엔터 키는 줄바꿈을 유지한다.
- 댓글·채팅 입력이 액세서리에 가려지지 않는다.
- 바텀시트 입력에서 툴바가 키보드 위에 표시되고 시트 위치와 충돌하지 않는다.
- 앱 시작 시 키보드가 순간적으로 나타나지 않는다.

- [ ] **Step 5: 사용자 검토 후 커밋**

추천 커밋 명령:

```bash
git add App.tsx docs/superpowers/specs/2026-07-20-global-keyboard-toolbar-design.md docs/superpowers/plans/2026-07-20-global-keyboard-toolbar.md
git commit -m "feat: 전역 키보드 툴바 추가"
```

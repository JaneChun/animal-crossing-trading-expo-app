---
name: fix-issue
description: GitHub 버그 이슈 하나를 규모에 따라 바로 수정하거나 /task-plan → /implement로 처리하고, iOS 시뮬레이터·Android 실기기(USB) 양쪽에서 키보드 상태까지 스크린샷으로 검증한 뒤 PR을 올린다. "/fix-issue 56", "이슈 56 해결해줘" 요청 시 사용.
argument-hint: "<이슈 번호>"
disable-model-invocation: true
---

# /fix-issue — 이슈 해결 (계획 → 구현 → 검증 → PR)

GitHub 이슈 하나를 받아 원인을 찾고 고친 뒤, iOS·Android 양쪽 스크린샷으로 검증하고 PR을 올린다.
이슈 본문의 **검증 기준**을 체크리스트로 쓴다. 이슈 형식은 `/create-issue`가 만든다.

## Argument Parsing

- `$ARGUMENTS` — 이슈 번호 (`56`, `#56`, 이슈 URL 모두 허용)
- 비어 있으면 `gh issue list --label bug --state open`을 보여주고 고르게 한다.

## Execution

### Step 1: 이슈 읽기와 사전 점검

```bash
gh issue view <번호> --json number,title,body,state
```

닫힌 이슈면 멈추고 알린다. 이어서 아래를 모두 확인한다. 실패한 항목은 `${CLAUDE_SKILL_DIR}/references/device-setup.md`의 처리를 따른다.

| 항목 | 확인 방법 |
|---|---|
| 작업 트리 | `git status --porcelain --untracked-files=no` — 변경이 있으면 멈추고 어떻게 할지 묻는다 |
| iOS 시뮬레이터 | `xcrun simctl list devices booted` → UDID 기록. `xcrun simctl listapps <UDID> \| grep com.janechun.animalcrossingtradingapp` |
| Android 실기기 (USB) | `adb devices -l` → `emulator-`로 시작하지 않는 기기의 serial 기록. `adb -s <serial> shell pm list packages \| grep com.janechun.animalcrossingtradingapp` |
| Firebase 에뮬레이터 | `lsof -nP -iTCP:8080 -sTCP:LISTEN` — 없으면 백그라운드로 실행한다. `./emulator-data`가 있으면 `npm run emulator:start-with-data`, 없으면(새 클론·워크트리, gitignore 대상) `npm run emulator:start`를 띄운 뒤 `npm run emulator:seed`로 데이터를 채운다 |
| Metro (에뮬레이터 모드) | `lsof -nP -iTCP:8081 -sTCP:LISTEN` — 이미 떠 있으면 어떤 모드로 띄웠는지 알 수 없으므로, 사용자에게 종료를 요청한 뒤 `npm run dev:emulator`를 백그라운드로 직접 실행한다 |
| 실기기 ↔ Mac 포트 연결 | `for p in 8081 9099 8080 5001 9199; do adb -s <serial> reverse tcp:$p tcp:$p; done` (매번 실행해도 무방) |
| 실기기 화면 | `adb -s <serial> shell input keyevent KEYCODE_WAKEUP` 후 캡처해서 잠금 화면이 아닌지 확인 |

**에뮬레이터 연결 확인 (필수)**: 두 기기에서 앱을 재실행한 뒤 아래 두 가지를 모두 확인해야 Step 2로 넘어간다. 하나라도 확인되지 않으면 운영 Firebase에 연결된 것으로 보고 멈춘다.

1. Metro 출력에 기기마다 `✅ Firebase Emulator 연결 완료` 로그가 찍힌다.
2. 홈 화면 스크린샷에 에뮬레이터 데이터(`npm run emulator:seed`로 넣은 시드 게시글 등)가 보이고, 운영 게시글이 보이지 않는다. 에뮬레이터 UI(http://localhost:4000)의 Firestore 데이터와 비교한다.

연결 확인에 실패하면 먼저 앱이 이 스킬이 띄운 Metro에 붙었는지 확인한다(dev client는 마지막으로 연결한 Metro에 다시 붙는다, `agent_docs/environment.md`). 원인을 추측해서 우회하지 말고 사용자에게 보고한다. `.env*`는 읽기가 차단되어 있으므로 열지 않는다.

브랜치와 스크린샷 폴더를 만든다.

```bash
git fetch -q origin master
git switch -c fix/issue-<번호>-<영문 슬러그> origin/master
SHOTS="${TMPDIR:-/tmp}/fix-issue/issue-<번호>"; mkdir -p "$SHOTS"
S="${CLAUDE_SKILL_DIR}/scripts"
```

### Step 2: 버그 재현 (Before 촬영)

코드를 고치기 전에 양쪽 기기에서 증상을 재현하고 찍는다.

1. 이슈의 재현 경로대로 화면에 들어간다. 임시 Maestro 플로우를 `$SHOTS/flow-<화면>.yaml`에 쓰고 실행한다 (저장소에 넣지 않는다).
   ```bash
   maestro --device <UDID 또는 serial> test "$SHOTS/flow-<화면>.yaml"
   ```
   - 기존 `.maestro/**/*.yaml`에 같은 화면 진입 단계가 있으면 그대로 가져다 쓴다.
   - 요소는 `id`(testID)를 우선 쓰고, 없으면 `text`를 쓴다.
2. 캡처하고, 출력된 썸네일을 **Read로 열어** 의도한 화면·상태인지 확인한다.
   ```bash
   "$S/shot.sh" ios <UDID> "$SHOTS/<화면>_before_ios.png"
   "$S/shot.sh" android <serial> "$SHOTS/<화면>_before_android.png"
   ```
3. 입력 요소가 있는 화면은 인풋을 눌러 **키보드를 올린 상태**도 찍는다 (`_kb` 접미어: `<화면>_kb_before_ios.png`).

| 재현 결과 | 처리 |
|---|---|
| 이슈에 적힌 플랫폼에서 재현됨 | Step 3으로 |
| 재현되지 않음 | 찍은 스크린샷과 함께 보고하고, 계속할지 묻는다 |
| 다른 플랫폼에서도 재현됨 | 이슈 범위에 포함하고 리포트에 적는다 |

### Step 3: 원인 파악과 규모 판단

이슈의 관련 코드에서 시작해 원인을 확정한다. 수정할 파일 목록을 정한 뒤 아래 표로 진행 방식을 고른다.

| 조건 (하나라도 해당하면 복잡) | 진행 방식 |
|---|---|
| 수정 파일 3개 이상 | `/task-plan` → `/implement` |
| `src/components/ui/` 또는 2곳 이상에서 import되는 공통 컴포넌트를 수정 | `/task-plan` → `/implement` |
| 구조 변경 (새 컴포넌트·훅 추출, 네비게이션·스토어 변경) | `/task-plan` → `/implement` |
| 원인 후보가 둘 이상이고 실험으로 가려야 함 | `/task-plan` → `/implement` |
| 위에 해당 없음 | 바로 수정 |

판단 결과와 이유를 한 줄로 알리고 진행한다. 복잡으로 판단하면 `/task-plan`에 이슈 번호·원인·Step 2 스크린샷 경로를 넘긴다.

### Step 4: 구현

- 프로젝트 규칙(`CLAUDE.md`, `.claude/rules/react-typescript.md`, UI 작업이면 `agent_docs/design-system.md`)을 따른다.
- 원인을 고치는 최소 변경만 한다. 주변 코드 정리는 리포트에 "발견 사항"으로만 적는다.
- 공통 컴포넌트를 수정했다면 사용처 목록을 만든다. 이 목록 전체가 Step 5의 확인 대상이다.
  ```bash
  grep -rln "<컴포넌트명>" src --include='*.tsx'
  ```

### Step 5: 검증

1. 정적 검증: `npm run lint`, `npm run typecheck`. 실패하면 고치고 다시 돌린다.
2. 앱을 재실행한 뒤(`references/device-setup.md`의 "수정이 화면에 반영되지 않음") Step 2와 같은 화면·상태를 `_after_`로 찍는다.
3. 모든 썸네일을 Read로 열어 아래 기준으로 판정한다.

| 확인 항목 | 대상 |
|---|---|
| 이슈의 검증 기준을 모두 충족 | 항상 |
| 키보드를 올렸을 때 버튼·인풋(채팅·댓글 입력 포함)이 키보드 위에 보이고 가려지지 않음 | 입력 요소가 있는 화면 |
| 키보드를 내린 뒤 레이아웃이 원래대로 돌아옴 | 입력 요소가 있는 화면 |
| 하단 버튼이 홈 인디케이터·시스템 내비게이션 바에 가려지지 않음 | 하단 고정 버튼이 있는 화면 |
| 사용처마다 위 항목에서 이상 없음 | 공통 컴포넌트를 수정한 경우, Step 4의 사용처 전부 |
| 반대 플랫폼에서 레이아웃이 바뀌지 않음 | `Platform.OS` 분기나 플랫폼별 값을 바꾼 경우 |

- 사용처 중 도달할 수 없는 화면은 "촬영 불가 — {이유}"로 기록한다. 코드를 바꿔서 화면에 도달하지 않는다.
- 문제가 남아 있으면 Step 4로 돌아간다. 같은 문제로 3회 돌아가면 멈추고 상황을 보고한다.

### Step 6: 리포트와 커밋 제안

1. `${CLAUDE_SKILL_DIR}/templates/report.md` 형식으로 대화에 보고한다. 커밋 단위와 추천 커밋 메시지를 포함한다.
2. 재발 방지 가치가 있는 원인·함정을 발견했다면 `agent_docs/`의 해당 도메인 문서에 추가할 내용을 제안한다.
3. **여기서 멈춘다.** 사용자가 직접 커밋한 뒤 PR 진행을 요청할 때까지 기다린다.

### Step 7: 스크린샷 업로드와 PR

사용자가 PR 진행을 요청하면:

1. 스크린샷을 올린다. `pr-screenshots` 브랜치에 커밋·푸시되며, 현재 브랜치는 바뀌지 않는다.
   ```bash
   "$S/upload-shots.sh" <번호> "$SHOTS"
   ```
2. 출력된 URL로 `${CLAUDE_SKILL_DIR}/templates/screenshots.md` 형식의 스크린샷 섹션을 만든다.
3. `/gh-pr`을 불러 PR 본문을 작성한다. 넘길 내용:
   - 관련 이슈: `Closes #<번호>`
   - 스크린샷 섹션 (2번 결과)
   - 확인한 환경: iOS, Android 체크
4. 브랜치를 푸시하고 PR을 생성한다: `git push -u origin HEAD` → `/gh-pr`의 생성 단계.
5. PR URL을 보고한다.

## Rules

- 모든 수정은 iOS·Android 양쪽에서 확인한다. 이슈에 한 플랫폼만 적혀 있어도 마찬가지다.
- 캡처한 모든 이미지를 Read로 열어 본 뒤에만 판정에 쓴다. 스크립트 성공은 올바른 화면이라는 뜻이 아니다.
- 키보드 검증 스크린샷에는 소프트웨어 키보드가 실제로 보여야 한다.
- 커밋은 사용자가 한다. 이 스킬은 `pr-screenshots` 브랜치 업로드 외에는 커밋하지 않는다.
- 커밋 메시지·PR 본문에 AI 출처 표기를 넣지 않는다.
- 테스트는 Firebase 에뮬레이터 환경에서만 한다. Step 1의 연결 확인을 통과하기 전에는 앱 화면을 조작하지 않는다.
- 운영 Firebase에 연결된 정황(연결 로그 없음, 운영 데이터가 보임)이 하나라도 있으면 즉시 조작을 멈추고 보고한다. 운영 환경에서는 어떤 버튼도 누르지 않는다.
- 에뮬레이터 연결이 확인된 상태에서만 게시글 등록, 댓글·채팅 전송처럼 데이터를 쓰는 조작을 할 수 있다.
- 로그인·인증은 사용자에게 맡긴다.
- 임시 Maestro 플로우와 스크린샷은 `$SHOTS`에만 둔다. 저장소에 넣지 않는다.
- Android는 USB로 연결한 실기기로만 확인한다. 에뮬레이터를 띄우지 않는다.
- 실기기의 시스템 설정(내비게이션 모드, 글꼴 크기 등)을 바꿨다면 끝날 때 원래대로 되돌린다.
- 이 스킬이 띄우지 않은 시뮬레이터는 종료하지 않는다.
- 대화 출력은 한국어로 작성한다.

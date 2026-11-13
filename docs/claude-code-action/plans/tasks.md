# Claude Code Action 기반 PR 리뷰·@claude 작업 자동화

> 이슈: 없음
> 작업 종류: 기능 수정
> 상태: 진행중
> 생성일: 2026-11-10

## 개요

현재 PR 리뷰는 `ci.yml`의 `claude-review` 잡이 `ANTHROPIC_API_KEY`로 Claude CLI를 직접 실행하고, 출력한 마크다운을 `gh pr comment`로 게시하는 방식이다. 리뷰 기준은 프롬프트에 하드코딩되어 있고 영어로 출력된다.

이 작업에서는 리뷰를 `anthropics/claude-code-action@v1`과 Anthropic 공식 `code-review` 플러그인으로 교체하고, 리뷰를 한국어로 작성하게 한다. 그리고 `toegeun-route` 레포와 같은 구성으로, PR에 `@claude` 멘션 댓글을 달면 Claude가 추가 작업을 수행하고 커밋을 푸시하는 워크플로를 추가한다. 두 워크플로 모두 claude.ai 구독 토큰(`CLAUDE_CODE_OAUTH_TOKEN`)으로 인증한다.

- 포함: `ci.yml`의 `claude-review` 잡 제거, `claude-code-review.yml`·`claude.yml` 신규 작성
- 제외: lint·typecheck·functions 테스트 등 나머지 CI 잡, `ANTHROPIC_API_KEY` 시크릿 삭제(사용자가 직접 판단)

## Phase 1: 자동 PR 리뷰를 claude-code-action으로 교체

- [x] `claude-review` 잡 제거 (`.github/workflows/ci.yml`)
  - 패턴: 잡 사이에 `# ───` 구분 주석 블록이 있으므로, 해당 블록 주석까지 함께 삭제한다. 다른 잡은 `claude-review`에 `needs`로 의존하지 않는다.
- [x] 리뷰 워크플로 신규 작성 (`.github/workflows/claude-code-review.yml`)
  - 패턴: `anthropics/claude-code-action` 공식 예시(`examples/pr-review-comprehensive.yml`)의 구조. `plugin_marketplaces: https://github.com/anthropics/claude-plugins-official.git`, `plugins: code-review@claude-plugins-official`, `prompt: /code-review:code-review ${{ github.repository }}/pull/${{ github.event.pull_request.number }} --comment`
  - 패턴: 권한은 `contents: read`, `pull-requests: write`, `id-token: write`. 플러그인이 사용하는 `gh pr diff/view/comment`, `mcp__github_inline_comment__create_inline_comment`는 커맨드 frontmatter의 `allowed-tools`로 허용된다.
  - 패턴: draft PR 제외 조건 `github.event.pull_request.draft == false`는 기존 `claude-review` 잡에서 가져온다. `concurrency`로 같은 PR의 이전 리뷰 실행을 취소한다(`ci.yml`과 같은 방식).
  - 결정: 인증은 `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` (사용자 지시)
  - 결정: 트리거는 `opened`·`synchronize`·`ready_for_review`·`reopened`를 유지하고, 재리뷰 스킵은 플러그인 동작에 맡긴다 (사용자 지시)
  - 결정: 한국어 출력은 `claude_args`의 `--append-system-prompt`로 지시한다. 플러그인 커맨드 본문은 수정할 수 없기 때문이다.
- [x] YAML 문법 검증 — `actionlint`(없으면 `npx yaml-lint` 등)로 두 파일을 검사한다.
  - 결정: actionlint 바이너리 다운로드가 권한 분류기에 막혀, 프로젝트에 설치된 `yaml` 패키지로 파싱·구조를 검사했다. 표현식·액션 입력 검증은 실제 PR 실행으로 확인한다.

## Phase 2: @claude 멘션 작업 워크플로 추가

- [x] `@claude` 워크플로 신규 작성 (`.github/workflows/claude.yml`)
  - 재사용: `JaneChun/toegeun-route`의 `.github/workflows/claude.yml` 구조(트리거 3종, `github.actor == 'JaneChun'` 제한, 권한 5종, `npm ci` 후 action 실행)
  - 패턴: Node 버전과 캐시는 `ci.yml`과 같이 `node-version: 22`, `cache: npm`
  - 결정: `--allowedTools "Bash(npm run lint),Bash(npm run typecheck)"`. `npm run test`는 Maestro E2E를 포함해 CI에서 실행할 수 없으므로 제외한다.
  - 결정: 작업 결과는 해당 PR 브랜치에 바로 커밋 푸시한다(action 기본 동작, 사용자 지시). 별도 브랜치·PR 생성 설정은 넣지 않는다.
- [x] YAML 문법 검증 (Phase 1과 같은 도구)

## Phase 3: 사전 설정 및 실제 동작 확인 (사용자 작업 포함)

- [ ] Claude GitHub App 설치 확인 — 로컬 Claude Code에서 `/install-github-app` 실행 또는 https://github.com/apps/claude 설치
- [x] `CLAUDE_CODE_OAUTH_TOKEN` 시크릿 등록 — `claude setup-token`으로 발급 후 `gh secret set CLAUDE_CODE_OAUTH_TOKEN`. 현재 레포 시크릿에는 `ANTHROPIC_API_KEY`, `FIREBASE_PROJECT_ID`만 있다.
- [ ] 이 브랜치로 PR 생성 → 한국어 리뷰 코멘트가 달리는지 확인
- [ ] PR에 `@claude` 댓글 → 작업 후 커밋이 푸시되는지 확인
  - 패턴: `issue_comment`·`pull_request_review` 이벤트 워크플로는 기본 브랜치(master)에 있는 파일 기준으로 실행된다. 따라서 `@claude` 동작은 이 PR이 머지된 뒤에야 확인할 수 있다.
- [x] 함정 기록 — 위 기본 브랜치 제약과 플러그인 재리뷰 스킵 동작을 `agent_docs/commands.md`에 한 줄씩 추가

## 진행 기록

### 2026-11-10

- Phase 1 완료
- 검증: `yaml` 패키지로 `ci.yml`·`claude-code-review.yml` 파싱 성공, `ci.yml`에 `claude-review` 참조 없음 확인
- Phase 2 완료
- 검증: `yaml` 패키지로 `claude.yml` 파싱 성공
- Phase 3: 함정 기록 완료. 나머지 4개 항목은 사용자 작업(GitHub App 설치, 시크릿 등록, PR 생성, 머지 후 `@claude` 확인)으로 대기
- PR #45 생성. 시크릿 등록 확인(`gh secret list`)

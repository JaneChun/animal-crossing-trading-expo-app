#!/usr/bin/env bash
# 스크린샷을 pr-screenshots 브랜치의 issue-<번호>/ 폴더에 올리고, PR 본문에 넣을 URL을 출력한다.
# 임시 worktree에서 작업하므로 현재 브랜치와 작업 트리는 바뀌지 않는다.
# 썸네일(-s.png)은 올리지 않고, 원본은 긴 변 1200px로 줄여서 올린다.
#
# usage: upload-shots.sh <issue-number> <shots-dir>
# 출력: "<파일명> <URL>" 한 줄씩
set -euo pipefail

issue="${1:?usage: upload-shots.sh <issue-number> <shots-dir>}"
src="${2:?usage: upload-shots.sh <issue-number> <shots-dir>}"
BRANCH=pr-screenshots

repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
wt="$(mktemp -d "${TMPDIR:-/tmp}/pr-shots.XXXXXX")/wt"
tmp_branch=""

cleanup() {
  git worktree remove --force "$wt" >/dev/null 2>&1 || true
  if [ -n "$tmp_branch" ]; then git branch -D "$tmp_branch" >/dev/null 2>&1 || true; fi
}
trap cleanup EXIT

if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git fetch -q origin "$BRANCH"
  git worktree add -q --detach "$wt" FETCH_HEAD
else
  # 첫 업로드: 코드 이력과 섞이지 않도록 orphan 브랜치로 시작한다
  tmp_branch="pr-screenshots-tmp-$$"
  git worktree add -q --detach "$wt" HEAD
  git -C "$wt" checkout -q --orphan "$tmp_branch"
  git -C "$wt" rm -rq --cached .
  find "$wt" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
fi

dest="$wt/issue-$issue"
mkdir -p "$dest"
found=0
for f in "$src"/*.png; do
  [ -e "$f" ] || continue
  case "$f" in *-s.png) continue ;; esac
  sips -Z 1200 "$f" --out "$dest/$(basename "$f")" >/dev/null 2>&1 || cp "$f" "$dest/"
  found=1
done
if [ "$found" = 0 ]; then
  echo "업로드할 PNG가 없습니다: $src" >&2
  exit 1
fi

git -C "$wt" add "issue-$issue"
if ! git -C "$wt" diff --cached --quiet; then
  git -C "$wt" commit -q -m "chore: 이슈 #$issue 스크린샷"
  git -C "$wt" push -q origin "HEAD:refs/heads/$BRANCH"
fi

for f in "$dest"/*.png; do
  name=$(basename "$f")
  echo "$name https://raw.githubusercontent.com/$repo/$BRANCH/issue-$issue/$name"
done

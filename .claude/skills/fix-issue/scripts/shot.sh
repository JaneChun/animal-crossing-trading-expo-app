#!/usr/bin/env bash
# iOS 시뮬레이터 또는 USB로 연결한 Android 기기의 현재 화면을 캡처하고, 확인용 썸네일(-s.png, 긴 변 800px)을 만든다.
#
# usage: shot.sh <ios|android> <udid|serial> <out.png>
# 출력: 썸네일 경로 (썸네일을 못 만들면 원본 경로)
set -euo pipefail

platform="${1:?usage: shot.sh <ios|android> <udid|serial> <out.png>}"
id="${2:?usage: shot.sh <ios|android> <udid|serial> <out.png>}"
out="${3:?usage: shot.sh <ios|android> <udid|serial> <out.png>}"
ADB="${ADB:-$(command -v adb || echo "$HOME/Library/Android/sdk/platform-tools/adb")}"
mkdir -p "$(dirname "$out")"

case "$platform" in
  ios) xcrun simctl io "$id" screenshot "$out" >/dev/null 2>&1 ;;
  android) "$ADB" -s "$id" exec-out screencap -p > "$out" ;;
  *) echo "platform은 ios 또는 android여야 합니다: $platform" >&2; exit 1 ;;
esac

thumb="${out%.png}-s.png"
if sips -Z 800 "$out" --out "$thumb" >/dev/null 2>&1; then
  echo "$thumb"
else
  echo "$out"
fi

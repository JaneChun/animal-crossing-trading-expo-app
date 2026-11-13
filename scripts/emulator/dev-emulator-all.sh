#!/usr/bin/env bash
# Firebase 에뮬레이터(데이터 유지)를 백그라운드로 띄우고, 준비되면 에뮬레이터 모드 Metro를 실행한다.
# Metro를 종료하면 에뮬레이터에 SIGINT를 보내 ./emulator-data로 export한 뒤 함께 종료한다.
# npm run dev:emulator:all 로 실행한다 (node_modules/.bin의 firebase를 PATH에 넣기 위해).
set -e
cd "$(dirname "$0")/../.."

EMULATOR_LOG="${TMPDIR:-/tmp}/firebase-emulator.log"
READY_TIMEOUT_SECONDS=120

import_args=()
if [ -d ./emulator-data ]; then
	import_args=(--import ./emulator-data)
fi

# set -m: 에뮬레이터를 별도 프로세스 그룹으로 띄워, Metro에서 누른 Ctrl+C가 에뮬레이터에 직접 전달되지 않게 한다.
# 종료 신호는 아래 cleanup에서 한 번만 보낸다.
set -m
firebase emulators:start "${import_args[@]}" --export-on-exit ./emulator-data >"$EMULATOR_LOG" 2>&1 &
EMULATOR_PID=$!
set +m

cleanup() {
	if kill -0 "$EMULATOR_PID" 2>/dev/null; then
		echo "🛑 Firebase 에뮬레이터 종료 중 (./emulator-data로 export)..."
		kill -INT "$EMULATOR_PID"
		wait "$EMULATOR_PID" 2>/dev/null || true
		echo "✅ Firebase 에뮬레이터 종료 완료"
	fi
}
trap cleanup EXIT

echo "🔧 Firebase 에뮬레이터 시작 중... (로그: $EMULATOR_LOG)"
elapsed=0
until grep -q "All emulators ready" "$EMULATOR_LOG" 2>/dev/null; do
	if ! kill -0 "$EMULATOR_PID" 2>/dev/null; then
		echo "❌ Firebase 에뮬레이터가 시작 중에 종료되었습니다. 로그를 확인하세요: $EMULATOR_LOG"
		tail -n 20 "$EMULATOR_LOG"
		exit 1
	fi
	if [ "$elapsed" -ge "$READY_TIMEOUT_SECONDS" ]; then
		echo "❌ ${READY_TIMEOUT_SECONDS}초 안에 에뮬레이터가 준비되지 않았습니다. 로그를 확인하세요: $EMULATOR_LOG"
		exit 1
	fi
	sleep 1
	elapsed=$((elapsed + 1))
done
echo "✅ Firebase 에뮬레이터 준비 완료 (UI: http://localhost:4000)"

EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true expo start --dev-client

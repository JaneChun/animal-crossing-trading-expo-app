#!/usr/bin/env bash
# Firebase 에뮬레이터(데이터 유지)를 백그라운드로 띄우고, 준비되면 에뮬레이터 모드 Metro를 실행한다.
# Metro를 종료하면 ./emulator-data로 export한 뒤 에뮬레이터를 함께 종료한다.
# 준비(All emulators ready) 전에 실패하면 export하지 않는다: 빈 상태로 기존 데이터를 덮어쓰지 않기 위함.
# npm run dev:emulator:all 로 실행한다 (node_modules/.bin의 firebase를 PATH에 넣기 위해).
set -e
cd "$(dirname "$0")/../.."

EMULATOR_LOG="${TMPDIR:-/tmp}/firebase-emulator.log"
READY_TIMEOUT_SECONDS=120

# Functions 에뮬레이터는 functions/lib를 로드하므로, 최신 src로 먼저 빌드한다.
echo "🔨 Functions 빌드 중..."
npm --prefix functions run build

import_args=()
if [ -d ./emulator-data ]; then
	import_args=(--import ./emulator-data)
fi

# set -m: 에뮬레이터를 별도 프로세스 그룹으로 띄워, Metro에서 누른 Ctrl+C가 에뮬레이터에 직접 전달되지 않게 한다.
# 종료 신호는 아래 cleanup에서 한 번만 보낸다.
set -m
firebase emulators:start "${import_args[@]}" >"$EMULATOR_LOG" 2>&1 &
EMULATOR_PID=$!
EMULATOR_READY=false
set +m

cleanup() {
	if kill -0 "$EMULATOR_PID" 2>/dev/null; then
		if [ "$EMULATOR_READY" = true ]; then
			echo "💾 ./emulator-data로 export 중..."
			firebase emulators:export ./emulator-data --force || echo "⚠️ export 실패 (기존 ./emulator-data 유지)"
		else
			echo "⚠️ 에뮬레이터가 준비되기 전에 종료되어 export를 건너뜁니다 (기존 ./emulator-data 유지)"
		fi
		echo "🛑 Firebase 에뮬레이터 종료 중..."
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
EMULATOR_READY=true
echo "✅ Firebase 에뮬레이터 준비 완료 (UI: http://localhost:4000)"

EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true expo start --dev-client

#!/usr/bin/env bash
# 실행 중인 Firebase 에뮬레이터에 SIGINT를 한 번만 보내고, export가 끝나 프로세스가 종료될 때까지 기다린다.
# 에뮬레이터는 두 번째 신호를 받거나 kill -9로 죽으면 export를 건너뛰므로 신호를 다시 보내지 않는다.
# 포트 정리(kill -9)는 CLI가 종료된 뒤 남은 프로세스(예: CLI만 죽고 남은 Firestore Java 프로세스)에만 한다.
EMULATOR_PATTERN='firebase emulators:(start|exec)'
EMULATOR_PORTS='4000,4400,4401,4500,4501,8080,9099,5001,9199'
WAIT_TIMEOUT_SECONDS=60

kill_leftover_ports() {
	pids=$(lsof -ti:"$EMULATOR_PORTS")
	if [ -n "$pids" ]; then
		echo "🧹 에뮬레이터 포트를 점유한 남은 프로세스를 정리합니다: $(echo $pids)"
		echo "$pids" | xargs kill -9
	fi
}

pkill -INT -f "$EMULATOR_PATTERN"
pkill_status=$?
if [ "$pkill_status" -eq 1 ]; then
	echo '실행 중인 Firebase 에뮬레이터가 없습니다'
	kill_leftover_ports
	exit 0
elif [ "$pkill_status" -ne 0 ]; then
	echo "⚠️  pkill이 실패했습니다 (종료 코드 ${pkill_status})"
	exit 1
fi

echo '🛑 Firebase 에뮬레이터 종료 중 (export가 끝날 때까지 기다립니다)...'
elapsed=0
while pgrep -f "$EMULATOR_PATTERN" >/dev/null; do
	if [ "$elapsed" -ge "$WAIT_TIMEOUT_SECONDS" ]; then
		echo "⚠️  ${WAIT_TIMEOUT_SECONDS}초가 지나도 종료되지 않았습니다. export가 아직 진행 중일 수 있습니다."
		echo '   다시 실행하면 두 번째 신호가 되어 export를 건너뛰므로, 잠시 기다린 뒤 프로세스가 종료됐는지 확인하세요.'
		echo "   dev:emulator:all로 띄웠다면 로그를 확인하세요: ${TMPDIR:-/tmp}/firebase-emulator.log"
		exit 1
	fi
	sleep 1
	elapsed=$((elapsed + 1))
done
kill_leftover_ports
echo '✅ Firebase 에뮬레이터 종료 완료'

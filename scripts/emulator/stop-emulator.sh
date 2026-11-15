#!/usr/bin/env bash
# 실행 중인 Firebase 에뮬레이터에 SIGINT를 한 번만 보내고, export가 끝나 프로세스가 종료될 때까지 기다린다.
# 에뮬레이터는 두 번째 신호를 받거나 kill -9로 죽으면 export를 건너뛰므로 신호를 다시 보내지 않는다.
# 패턴의 [f]는 이 스크립트를 실행한 셸의 명령줄('[f]irebase…')이 자기 자신과 매칭되지 않게 한다.
EMULATOR_PATTERN='[f]irebase emulators:start'
WAIT_TIMEOUT_SECONDS=60

if ! pkill -INT -f "$EMULATOR_PATTERN"; then
	echo '실행 중인 Firebase 에뮬레이터가 없습니다'
	exit 0
fi

echo '🛑 Firebase 에뮬레이터 종료 중 (export가 끝날 때까지 기다립니다)...'
elapsed=0
while pgrep -f "$EMULATOR_PATTERN" >/dev/null; do
	if [ "$elapsed" -ge "$WAIT_TIMEOUT_SECONDS" ]; then
		echo "⚠️  ${WAIT_TIMEOUT_SECONDS}초가 지나도 종료되지 않았습니다. 로그를 확인하세요: ${TMPDIR:-/tmp}/firebase-emulator.log"
		exit 1
	fi
	sleep 1
	elapsed=$((elapsed + 1))
done
echo '✅ Firebase 에뮬레이터 종료 완료'

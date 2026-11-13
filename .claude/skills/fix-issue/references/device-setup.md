# 기기 준비와 문제 해결

Step 1 사전 점검에서 실패한 항목이나, 촬영 중 문제가 생겼을 때만 읽는다.

## iOS 시뮬레이터

| 상황 | 처리 |
|---|---|
| 부팅된 시뮬레이터가 없음 | `xcrun simctl list devices available`에서 iPhone 하나를 골라 `xcrun simctl boot <UDID>` 후 `open -a Simulator` |
| 앱이 설치되지 않음 (`xcrun simctl listapps <UDID>`에 번들 ID 없음) | 네이티브 빌드가 필요하다. 사용자에게 `npm run ios` 실행을 요청하고 기다린다 |
| 인풋을 눌러도 소프트웨어 키보드가 안 보임 | 하드웨어 키보드 연결이 켜져 있다. 사용자에게 Simulator 메뉴 I/O → Keyboard → Connect Hardware Keyboard 해제(⇧⌘K)를 요청한다. 키보드가 안 보이는 상태의 스크린샷은 키보드 검증에 쓰지 않는다 |

## Android 실기기 (USB)

| 상황 | 처리 |
|---|---|
| `adb devices`에 기기가 없음 | 사용자에게 USB 연결과 개발자 옵션의 USB 디버깅 활성화를 요청하고 기다린다 |
| 기기 상태가 `unauthorized` | 사용자에게 기기 화면의 "USB 디버깅 허용" 팝업을 승인해 달라고 요청한다 |
| 실기기가 여러 대 연결됨 | 어느 기기로 확인할지 묻는다 |
| 앱이 설치되지 않음 (`adb shell pm list packages`에 패키지 없음) | 사용자에게 `npm run android` 실행을 요청하고 기다린다 (연결된 실기기에 설치된다) |
| 앱이 Metro에 연결되지 않음 (번들 로드 실패 화면) | `adb -s <serial> reverse tcp:8081 tcp:8081` 후 앱을 재실행한다 |
| 캡처가 잠금 화면·검은 화면 | `adb shell input keyevent KEYCODE_WAKEUP`. 잠금 해제는 사용자에게 요청한다 |
| 하단 시스템 바 관련 이슈 | 제스처 내비게이션과 3버튼 내비게이션 양쪽에서 찍는다. 현재 모드: `adb shell settings get secure navigation_mode` (0 = 3버튼, 2 = 제스처). 제조사 기기는 adb로 전환되지 않을 수 있으므로 사용자에게 설정 → 디스플레이 → 내비게이션 바에서 전환을 요청하고, 끝나면 원래 모드로 되돌려 달라고 한다 |

## 공통

| 상황 | 처리 |
|---|---|
| 앱 실행 시 빨간 화면 `TurboModuleRegistry.getEnforcing(...): '<모듈>' could not be found` | 설치된 dev client가 현재 코드의 네이티브 의존성보다 오래된 빌드다. JS 수정으로는 해결되지 않는다. 사용자에게 해당 플랫폼 재빌드(`npm run ios` / `npm run android`)를 요청한다 |
| Metro가 안 떠 있음 (`lsof -nP -iTCP:8081 -sTCP:LISTEN` 결과 없음) | `npm run dev:emulator`를 백그라운드로 실행한다. `npm run dev`(운영 연결)는 쓰지 않는다. 앱이 Metro에 붙지 않으면 앱을 재실행한다 |
| 연결 로그는 찍혔는데 앱에서 데이터를 못 불러옴 (Android) | 기기의 `localhost`가 Mac을 가리키지 않는 상태다. 9099·8080·5001·9199 포트의 `adb reverse`를 다시 실행하고 앱을 재실행한다 |
| 에뮬레이터에 데이터가 없음 | `npm run emulator:seed`로 시드 데이터를 넣는다 |
| 수정이 화면에 반영되지 않음 | Fast Refresh에 기대지 말고 앱을 재실행한다. iOS: `xcrun simctl terminate <UDID> <번들 ID>` → `xcrun simctl launch <UDID> <번들 ID>`. Android: `adb shell am force-stop <패키지>` → `adb shell monkey -p <패키지> 1` |
| 로그인 화면이 나옴 | 직접 로그인하지 않는다. 사용자에게 해당 기기에서 에뮬레이터 계정으로 로그인을 요청하고 기다린다 |
| Maestro가 요소를 못 찾음 | `maestro --device <ID> hierarchy`로 실제 텍스트·testID를 확인한다. 같은 조작이 2회 연속 실패하면 사용자에게 해당 화면을 띄워 달라고 요청한다 |

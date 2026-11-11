# Android 프로덕션 출시 대응

> 이슈: 없음
> 작업 종류: 기능 개발
> 상태: 대기
> 생성일: 2026-11-11

## 개요

앱은 지금까지 iOS로만 배포되었고, `app.config.js`에 Android 패키지명·`google-services.json` 경로·AdMob Android 앱 ID만 추가된 상태다. 로컬 `android/` 폴더는 2026-10-25에 생성된 SDK 54 시절 prebuild 결과물이고, Android 빌드 산출물(`android/app/build/outputs`)이 없으므로 Android 빌드가 끝까지 성공한 적은 없는 것으로 본다.

코드 탐색에서 Android에서 바로 문제가 되는 지점을 다음과 같이 확인했다.

- 로그인 화면에 Apple 버튼이 노출되지만, `expo-apple-authentication`은 iOS 전용이라 Android에서 누르면 실패한다. 카카오 버튼은 iOS에서도 주석 처리되어 있어, 지금 상태로는 Android 사용자가 네이버 로그인만 사용할 수 있다. → Android에 Google 로그인을 추가하고 Apple 버튼은 숨긴다.
- 광고 단위 ID(`src/constants/ads.ts`)가 iOS 값만 있어 Android에서도 iOS 광고 단위를 요청한다.
- 푸시 알림 채널을 만들지 않아 Android 13 이상에서 알림 권한 팝업이 뜨지 않는다. 알림 설정 토글은 iOS 전용 URL(`app-settings:`)로 이동한다.
- 사진 선택 전에 사진 보관함 권한을 요청한다. Android 13 이상은 시스템 사진 선택기가 권한 없이 동작하고, Google Play 정책은 핵심 기능이 아닌 앱의 `READ_MEDIA_IMAGES` 사용을 제한한다.
- 바텀시트가 열린 상태에서 Android 뒤로가기를 누르면 시트가 닫히지 않고 화면이 뒤로 이동한다.
- 다크 모드 테마가 없는데 `userInterfaceStyle: 'automatic'`이라 Android 다크 모드에서 상태바 아이콘·입력창 기본 글자색이 배경과 겹칠 수 있다.
- 스플래시 이미지가 전체 화면용(1242×2436)인데, Android 12 이상은 중앙 아이콘만 표시하는 방식이라 잘리거나 축소된다.
- 강제 업데이트 최소 버전이 플랫폼 공통 필드 하나라서, iOS만 먼저 올린 버전을 최소 버전으로 지정하면 Android 사용자가 존재하지 않는 버전으로 업데이트를 강요받는다.
- EAS 제출 설정과 배포 스크립트가 iOS만 있다.

Google Play 개발자 계정이 아직 없고, 신규 개인 계정은 프로덕션 공개 전에 테스터 12명 이상이 14일간 참여하는 비공개 테스트를 거쳐야 한다. 계정 생성 후 본인 인증에도 며칠이 걸리므로, 계정 생성(Phase 7 첫 항목)은 코드 작업과 병행해 먼저 시작한다.

**포함 범위**: 위 항목의 코드 수정, Android Google 로그인(앱 + Cloud Functions), Android 빌드·제출 설정, 외부 콘솔(EAS, Firebase, Google Cloud, AdMob, 네이버 개발자센터, Google Play Console) 준비 작업, 실기기 QA, 문서 갱신.
**제외 범위**: 카카오 로그인 재활성화(iOS에서도 비활성 상태라 이번 작업과 무관), Android의 Apple 로그인과 iOS의 Google 로그인(후속 작업으로 추가 예정), 다크 모드 테마 구현, Cloud Functions 푸시 페이로드 변경(클라이언트에서 `default` 채널을 만들면 Expo 푸시가 해당 채널을 사용하므로 서버 수정이 필요 없음).

## Phase 1: Android 빌드 설정과 첫 개발 빌드

- [ ] Android 전용 설정 추가 (`app.config.js`)
  - `android.userInterfaceStyle: 'light'` — iOS 설정은 건드리지 않는다
  - `android.blockedPermissions`: `android.permission.READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW`, `RECORD_AUDIO`
  - 패턴: 기존 `ios` 블록처럼 플랫폼 키 아래에 둔다. `expo-image-picker` 플러그인의 `microphonePermission: false`가 iOS 쪽 동일 목적 설정이다
  - 주의: 사진 권한을 막으면 Phase 6의 `useImagePicker` 수정 없이는 Android에서 사진 선택이 막힌다. Phase 6 전까지 사진 선택은 QA 대상에서 뺀다
- [ ] Android 스플래시 설정 (`app.config.js` plugins)
  - `['expo-splash-screen', { android: { image, imageWidth, backgroundColor: '#ffffff' } }]` 추가. 최상위 `splash`와 `ios.splash`는 그대로 둔다
  - 결정: Android 12+ 원형 마스크용 로고 에셋을 따로 준비하고, 이 항목에 도달했을 때 사용자에게 요청한다(사용자 지시). 에셋을 받기 전까지 이 항목만 보류하고 나머지는 진행한다
- [ ] EAS 환경 변수 등록 (EAS 대시보드, 코드 변경 없음)
  - `GOOGLE_SERVICES_JSON`을 file 타입 변수로 등록(로컬 파일은 git 미추적이라 EAS 빌드 서버에 없다). iOS의 `GOOGLE_SERVICE_INFO_PLIST` 등록 방식과 동일하게 맞춘다
  - `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` 등록 여부 확인
- [ ] Android 개발 빌드 생성과 실행 (`npm run build:android:dev` 또는 `npx expo run:android`)
  - 로컬 `android/`는 SDK 54 시절 산출물이므로 `npx expo prebuild -p android --clean` 후 빌드한다
  - 빌드 실패 시 의심 순서: `react-native-fast-image`(유지보수 중단, New Architecture interop 의존), `@react-native-seoul/naver-login`, `@react-native-kakao/core`(Kakao Maven 저장소는 `expo-build-properties`에 설정됨)
- [ ] 생성된 `android/app/src/main/AndroidManifest.xml`의 권한 목록 확인 — `POST_NOTIFICATIONS`, `CAMERA`, `INTERNET`, `AD_ID`만 남고 차단한 권한이 없어야 한다. `targetSdkVersion`이 Play 요구 수준(신규 앱 기준 API 36)인지 확인

## Phase 2: Google 로그인 서버 검증 (Cloud Functions)

- [ ] Google ID 토큰 검증 함수 추가 (`functions/src/auth/google.ts`, `functions/package.json`)
  - 패턴: `functions/src/auth/apple.ts`의 `handleAppleLogin` — 입력 누락 시 `invalid-argument`, 검증 실패 시 `unauthenticated`, 그 외 예외는 `internal`로 감싸고 `{ providerId, email }` 반환
  - `google-auth-library`의 `OAuth2Client.verifyIdToken({ idToken, audience })`로 서명·만료·발급자를 검증하고 `payload.sub`를 `providerId`로 쓴다. 지금은 `firebase-admin`의 하위 의존성으로만 설치되어 있으므로 `functions/package.json`에 직접 추가한다
  - `audience`는 Google Cloud의 웹 클라이언트 ID다. Functions 환경 변수(`defineString` 또는 `.env`)로 주입한다
  - 결정: 기존 소셜 로그인과 같은 커스텀 토큰 방식(uid = 제공자 계정 ID)을 따른다. Firebase Auth의 Google 제공자는 쓰지 않는다
- [ ] `createFirebaseCustomToken`에 `google` 분기 추가 (`functions/src/auth/customToken.ts`)
  - 30일 재가입 제한(`isUserRestrictedFromRejoining`)은 기존 분기와 동일하게 적용된다
- [ ] 단위 테스트 추가 (`functions/__tests__/auth/google.test.ts`, `functions/__tests__/auth/customToken.test.ts`)
  - 재사용: `functions/__tests__/auth/apple.test.ts`의 mock 구성
  - 확인: `npm --prefix functions test -- auth`, `npm run typecheck:functions`
- [ ] Functions 배포 (`npm run deploy:functions`) — 앱 배포보다 먼저 한다. 기존 iOS 클라이언트는 `google` 분기를 호출하지 않으므로 영향이 없다

## Phase 3: 로그인 (앱)

- [ ] Google Cloud·Firebase 콘솔 준비 (콘솔 작업)
  - Firebase Android 앱에 SHA-1 등록: 로컬 디버그 키, EAS 업로드 키(`npx eas credentials -p android`). Play 앱 서명 키 SHA-1은 Phase 7에서 Play Console 앱을 만든 뒤 추가한다
  - 등록 후 `google-services.json`을 다시 내려받아 로컬과 EAS 파일 변수를 교체
  - 웹 클라이언트 ID를 `.env`와 EAS 환경 변수에 `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`로 등록
- [ ] Google 로그인 라이브러리 설치와 설정 (`package.json`, `app.config.js`)
  - `npx expo install @react-native-google-signin/google-signin` 후 plugins에 `'@react-native-google-signin/google-signin'` 추가. 네이티브 모듈이라 개발 빌드를 다시 만들어야 한다
- [ ] 타입·서비스·스토어에 Google 추가
  - `src/types/user.ts`: `OauthType`에 `'google'`, `GetFirebaseCustomTokenParams.idToken` 주석에 Google 추가
  - `src/stores/auth/types.ts`: `AuthProviderType`, `googleLogin`·`googleLogout`·`googleDeleteAccount`
  - `src/firebase/services/authService.ts`: `loginWithGoogle` — `GoogleSignin.signIn()`으로 받은 `idToken`을 `getFirebaseCustomToken({ oauthType: 'google', idToken })`에 전달. 취소 시 `null` 반환
  - `src/stores/auth/providers/google.ts`: 패턴은 `naver.ts` — 로그아웃 시 `GoogleSignin.signOut()`, 탈퇴 시 `GoogleSignin.revokeAccess()`
  - `src/stores/auth/utils/initialization.ts`: `GoogleSignin.configure({ webClientId })`를 `initializeAllSDKs`에 추가. 패턴은 `initializeNaverSDK`(설정값 누락 시 경고 후 종료)
  - `src/stores/auth/store.ts`: `GoogleAuthProvider` 인스턴스 연결
- [ ] 로그인 버튼과 화면 분기
  - `src/components/ui/SocialLoginButton.tsx`, `src/theme/Color.ts`(`social.google`, `social.googleText`): Google 버튼. 로고는 Google 공식 브랜드 리소스의 "G" 로고(`assets/images/google.png`)를 사용하고, 버튼 배경·테두리는 Google 브랜드 가이드라인을 따른다
  - 결정: 버튼 문구는 기존 형식에 맞춰 `Google로 로그인`(사용자 지시)
  - `src/screens/Login.tsx`: Android는 네이버·Google, iOS는 네이버·Apple. 패턴은 `Platform.OS` 분기(`src/stores/ads/initializer.ts:23`)
  - 결정: Android 로그인 화면에 Apple 가입자용 안내 문구는 표시하지 않는다. Android Apple 로그인과 iOS Google 로그인은 후속 작업으로 추가한다(사용자 지시). 후속 작업에서 플랫폼 분기를 걷어내기 쉽도록 버튼 노출 조건은 한 곳에 모아 둔다
  - `src/screens/Account.tsx`: 이메일 옆 Google 아이콘(`src/components/ui/Icons/Google.tsx`, 패턴은 `Naver.tsx`), 로그아웃 분기, 탈퇴 시 `navigateToSocialAccountCheck` 분기
  - `src/screens/SocialAccountCheck.tsx`, `src/screens/DeleteAccount.tsx`: 탈퇴 전 재인증과 탈퇴 처리에 `google` 분기 추가
- [ ] 개인정보처리방침의 소셜 로그인 제공자에 Google 추가 (`src/screens/PrivacyPolicy.tsx:53`) — 문구는 기존 형식(`카카오주식회사, 네이버주식회사, Apple Inc.`)에 `Google LLC`를 덧붙인다
- [ ] Firestore 규칙 변경이 필요 없는지 확인 (`firestore.rules`) — 현재 규칙은 `oauthType` 값을 검사하지 않는다
- [ ] 네이버 개발자센터에 Android 환경 등록(패키지명 `com.janechun.animalcrossingtradingapp`, 마켓 URL) 후, Android 실기기에서 네이버·Google 로그인·로그아웃·회원 탈퇴 확인
  - 네이버는 네이버 앱 설치/미설치 두 경우 모두 확인
  - iOS 개발 빌드에서 로그인 화면이 기존과 같은지(네이버·Apple) 확인

## Phase 4: 푸시 알림

- [ ] FCM V1 서비스 계정 키를 EAS Android 자격 증명에 업로드 (콘솔 작업, `npx eas credentials -p android`)
- [ ] Android 알림 채널 생성 (`src/utilities/registerForPushNotificationsAsync.ts`)
  - 권한 확인(`getPermissionsAsync`) 이전에 `Platform.OS === 'android'`일 때 `Notifications.setNotificationChannelAsync('default', { name, importance: AndroidImportance.MAX })` 호출. Android 13 이상은 채널이 하나도 없으면 권한 팝업이 뜨지 않는다
  - 결정: 채널은 하나만 두고 이름은 `알림`(사용자 지시). 채팅·댓글 채널 분리는 하지 않으므로 Functions 수정이 없다
- [ ] 알림 아이콘·색상 설정 (`app.config.js` plugins에 `['expo-notifications', { icon, color }]`)
  - 아이콘이 없으면 Android 상태바에 회색 사각형으로 표시된다
  - 결정: 에셋(투명 배경 흰색 실루엣 PNG, 96×96 이상)과 강조 색상은 이 항목에 도달했을 때 사용자에게 요청한다(사용자 지시). 받기 전까지 이 항목만 보류하고 Phase 4의 나머지는 진행한다
- [ ] 알림 설정 토글이 Android 설정 화면을 열도록 수정 (`src/components/Profile/PushNotificationToggle.tsx:26`)
  - `Linking.openURL('app-settings:')` → `Linking.openSettings()`. React Native 기본 API이며 iOS에서도 같은 화면(앱 설정)을 연다
- [ ] 알림 수신·탭 이동을 실기기에서 확인 (`src/stores/push/initializer.ts`)
  - 포그라운드, 백그라운드, 앱 종료 상태 각각에서 채팅·댓글 알림 탭 → 해당 화면 이동
  - 앱 종료 상태에서 탭했을 때 이동하지 않으면 `Notifications.getLastNotificationResponseAsync()`로 콜드 스타트 응답을 처리하는 코드를 추가한다

## Phase 5: 광고

- [ ] AdMob 콘솔에서 Android 앱의 전면·네이티브 광고 단위 발급, `app-ads.txt` 확인 (콘솔 작업)
- [ ] EAS 환경 변수에 `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID_ID`, `EXPO_PUBLIC_ADMOB_NATIVE_ANDROID_ID` 등록, `.env`에도 추가
- [ ] 광고 단위 ID를 플랫폼별로 분기 (`src/constants/ads.ts`)
  - 패턴: 기존 `TEST_IDS`/`PROD_IDS` 구조에 `_ANDROID` 키를 추가하고 `AD_UNIT_IDS`에서 `Platform.select`로 선택
  - Android 테스트 ID: 전면 `ca-app-pub-3940256099942544/1033173712`, 네이티브 `ca-app-pub-3940256099942544/2247696110`
  - 사용처: `src/hooks/ads/useNativeAd.ts`, `src/hooks/ads/useInterstitialAd.ts` — 수정 불필요
- [ ] Android 개발 빌드에서 홈 목록 네이티브 광고와 전면 광고가 테스트 광고로 표시되는지 확인 (`src/components/Home/NativeAdUnit.tsx`)

## Phase 6: 화면·입력 동작

- [ ] 사진 선택 시 Android에서는 사진 보관함 권한 확인을 건너뛰기 (`src/hooks/shared/useImagePicker.ts`)
  - `pickImage`에서 `verifyPhotosPermissions()`를 iOS일 때만 호출. 카메라 권한(`verifyCameraPermissions`)은 그대로 둔다
  - 확인: 프로필 사진, 게시글 이미지(여러 장, 순서 유지), 채팅 사진 전송·촬영
- [ ] 바텀시트가 열려 있을 때 뒤로가기로 시트를 닫기 (`src/components/ui/CustomBottomSheet.tsx`)
  - `isVisible`이 true인 동안 `BackHandler.addEventListener('hardwareBackPress')`를 등록해 `onClose()` 호출 후 `true` 반환, 닫힘·언마운트 시 `remove()` (CLAUDE.md 규칙 6)
  - 영향 범위: `CustomBottomSheet`를 쓰는 모든 모달(아이템 추가·수정, 일괄 추가, 주민 추가, 댓글 수정, 신고, 프로필 수정 등)
- [ ] 키보드가 입력창을 가리지 않는지 화면별 확인 후 수정
  - 대상: `src/screens/ChatRoom.tsx`(`GiftedChat`의 `bottomOffset`과 `useKeyboardHeight`), `src/screens/PostDetail.tsx:306`, `src/screens/NewPost.tsx:241`(둘 다 Android `behavior: 'height'`), `src/screens/SignUpDisplayName.tsx:56`, `src/screens/SignUpIslandName.tsx:86`(둘 다 Android `behavior: undefined`)
  - 패턴: 툴바 높이는 `KEYBOARD_TOOLBAR_HEIGHT`로 보정한다(`agent_docs/architecture.md`). 화면이 두 번 밀리거나 가려지면 RN 기본 `KeyboardAvoidingView` 대신 `react-native-keyboard-controller`의 `KeyboardAvoidingView`로 교체하는 것을 우선 검토한다. 바텀시트 안에서는 `useReanimatedKeyboardAnimation`을 쓰지 않는다
- [ ] 엣지 투 엣지 레이아웃 확인 — 하단 내비게이션 바(3버튼·제스처 모드 둘 다)가 하단 탭, 게시글 작성 버튼, 채팅 입력창, 이미지 뷰어 닫기 버튼을 가리지 않는지 확인
  - 패턴: 화면 하단은 `SafeAreaView edges={['bottom']}` 또는 `useSafeAreaInsets().bottom`으로 처리한다(`App.tsx`의 루트 `SafeAreaView`는 하단을 제외함)
- [ ] 화면 전반 시각 QA — 그림자(`src/theme/Shadow.ts`의 `elevation`), 한글 폰트 굵기·줄 높이, 이미지 캐러셀(`react-native-snap-carousel` 패치 적용), 이미지 뷰어 스와이프 닫기, 드롭다운 모달, 토스트 위치, GIF 로딩 인디케이터

## Phase 7: 버전 관리와 스토어 출시

- [ ] Google Play 개발자 계정 생성과 본인 인증 (콘솔 작업) — 인증에 며칠이 걸리므로 Phase 1과 병행해 먼저 시작한다
- [ ] 플랫폼별 최소 버전 지원 (`src/firebase/services/versionService.ts`)
  - 결정: 플랫폼별로 나눈다(사용자 지시). 기존 iOS 클라이언트가 `minimum_version`을 읽고 있으므로 이 필드는 iOS용으로 유지하고, Android는 새 필드 `minimum_version_android`를 읽는다. `force_update`, `update_message`는 공통으로 유지
  - 패턴: `getStoreUrl`과 같은 `Platform.OS` 분기. `AppVersionConfig` 인터페이스에 필드 추가
- [ ] Firestore `app_config/version_control` 문서에 `minimum_version_android`와 `store_urls.android`(Play 스토어 https URL) 입력 (콘솔 작업)
  - `UpdateModal`은 `Linking.canOpenURL`을 먼저 호출하므로, https URL이면 Expo가 기본 생성하는 `<queries>`로 동작한다
- [ ] EAS 제출 설정과 배포 스크립트 추가 (`eas.json`, `package.json`)
  - `submit.production.android`: `serviceAccountKeyPath`, `track: 'internal'`
  - 스크립트: `deploy:android`(`npx eas submit -p android --latest`), `release:android`(`--auto-submit`)
  - 패턴: 기존 `deploy:app`, `release:ios` 스크립트와 같은 형식
- [ ] Google Play Console 앱 등록 (콘솔 작업)
  - 앱 생성, 스토어 등록정보(스크린샷은 Android 기기 기준), 콘텐츠 등급, 타겟 연령, 광고 포함 선언, 광고 ID(`AD_ID`) 사용 선언, 데이터 보안 양식(Firebase Auth·Analytics·AdMob·Google 로그인 수집 항목), 개인정보처리방침 URL, 계정 삭제 안내 URL
  - 첫 AAB는 Play API로 올릴 수 없으므로 `npm run build:android` 결과물을 콘솔에서 직접 업로드한다. 이후부터 `eas submit` 사용
  - 앱 서명: `@janechun__animal-crossing-trading-app.jks`(git 미추적)가 EAS 업로드 키와 같은지 `npx eas credentials -p android`로 확인하고 Play 앱 서명을 사용한다
  - Play 앱 서명 키의 SHA-1을 Firebase Android 앱에 추가하고 `google-services.json`을 다시 교체한다. 이 단계를 빠뜨리면 Play에서 받은 앱에서만 Google 로그인이 실패한다(`DEVELOPER_ERROR`)
- [ ] 내부 테스트 트랙 배포 후 설치·로그인(네이버·Google)·푸시·광고 확인, 사전 출시 보고서와 16KB 페이지 크기 경고 확인
- [ ] 비공개 테스트 트랙에 테스터 12명 이상을 14일 이상 유지한 뒤 프로덕션 액세스 신청
  - 결정: 신규 개인 계정이라 비공개 테스트를 거친다(사용자 확인). 14일은 테스터가 계속 옵트인 상태여야 계산된다
- [ ] 문서 갱신 (`CLAUDE.md` 상태 줄, `agent_docs/commands.md` 배포 명령어, `agent_docs/environment.md` 환경 변수 목록과 Android 에뮬레이터에서 Firebase 에뮬레이터 호스트는 `localhost`가 아니라 `10.0.2.2`라는 점) — CLAUDE.md 규칙 7에 따라 수정 전에 사용자 확인

## 진행 기록

### 2026-11-11

- 참고: `functions/src/auth/apple.ts`가 쓰는 `jsonwebtoken`, `jwks-rsa`는 `functions/package.json`에 선언되어 있지 않고 하위 의존성으로만 설치되어 있다. 이번 범위 밖이라 수정하지 않는다

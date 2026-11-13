# Google 로그인 추가 & Android 지원 설계

작성일: 2026-10-14

## 1. 목표 (WHAT / WHY)

Android 지원을 시작하면서 소셜 로그인을 다음과 같이 확장한다.

- **iOS**: Apple / Google / 네이버
- **Android**: Google / 네이버 (Apple은 네이티브 미지원이라 제외)

Apple은 iOS에서 "다른 소셜 로그인을 제공하면 Apple 로그인 필수"라는 App Store 정책 때문에 유지한다. Android에는 그 정책이 적용되지 않으므로 Google이 Apple의 자리를 대신한다.

네이버는 이미 양 플랫폼을 지원하는 `@react-native-seoul/naver-login`으로 완전 구현돼 있어 **코드 신규 작업 없음** — Android 실기기 동작 확인만 한다.

따라서 이 설계의 실질 신규 작업은 **Google 로그인 provider 추가**다.

## 2. 설계 원칙 — 기존 커스텀 토큰 흐름 유지

이 코드베이스는 모든 provider를 `providerId` 하나로 통일한다. 흐름:

```
클라이언트 SDK 로그인 → 토큰 획득 → CF(getFirebaseCustomToken)가 서버에서 토큰 검증
→ providerId/email 추출 → 재가입 제한 검사 → Firebase 커스텀 토큰 발급
→ 클라이언트 signInWithCustomToken
```

Google도 **Apple과 동일하게 idToken 기반**으로 이 흐름에 태운다.

- **트레이드오프**: Firebase `GoogleAuthProvider`(클라이언트 `signInWithCredential`) 직접 사용이 코드는 짧지만, providerId 체계가 갈라지고 서버 검증·재가입 제한(`isUserRestrictedFromRejoining`)을 우회한다. 기존 4개 provider와 이질적인 흐름이 생긴다.
- **결론**: 일관성·정책 재사용 이득이 크므로 커스텀 토큰 흐름 유지. Apple 케이스와 거의 판박이가 된다.

## 3. 라이브러리 & API (검증 완료)

`@react-native-google-signin/google-signin` (classic `GoogleSignin` API, v13+ 기준)

- `GoogleSignin.configure({ webClientId })` — `signIn()` 전에 필수. `webClientId`는 idToken 발급에 필요. Firebase 사용 시 `'autoDetect'` 가능(Android는 google-services.json에서 자동, iOS는 GoogleService-Info.plist에 `WEB_CLIENT_ID` 키 추가 필요).
- `await GoogleSignin.hasPlayServices()` — Android 필수 선행 호출.
- `const response = await GoogleSignin.signIn()` → `isSuccessResponse(response)`로 성공 판별. 성공 시 `response.data.idToken`, `response.data.user.email` 사용. 취소 시 `response.type === 'cancelled'`.
- 로그아웃: `GoogleSignin.signOut()`. 회원탈퇴: `GoogleSignin.revokeAccess()`.
- Expo config 플러그인: `["@react-native-google-signin/google-signin", { iosUrlScheme: "<REVERSED_CLIENT_ID>" }]`.

서버: `google-auth-library`의 `OAuth2Client.verifyIdToken({ idToken, audience })`. configure에 webClientId를 넘기면 idToken의 `aud`가 webClientId가 되므로 audience = webClientId. `payload.sub` → providerId, `payload.email` → email.

## 4. 변경 지점

### A. 서버 (Cloud Functions)

- `functions/package.json` — `google-auth-library` 의존성 추가.
- `functions/src/auth/google.ts` **(신규)** — `handleGoogleLogin(idToken)`: `verifyIdToken`으로 검증 후 `{ providerId: payload.sub, email: payload.email }` 반환. 기존 `naver.ts`/`apple.ts`와 동일한 에러 처리 패턴(HttpsError 재던짐, 그 외 internal 래핑).
- `functions/src/auth/customToken.ts` — `switch(oauthType)`에 `case 'google'` 추가. `CustomTokenRequest`는 `idToken` 필드를 이미 보유(Apple 공용)하므로 재사용.
- 환경변수 — Google Web Client ID를 서버에서 audience로 사용(functions env).

### B. 클라이언트 (앱)

- `package.json` — `@react-native-google-signin/google-signin` 추가.
- `app.config.js` — config 플러그인 추가(`iosUrlScheme`). iOS의 GoogleService-Info.plist에 `WEB_CLIENT_ID` 추가 여부는 configure 방식(명시 vs autoDetect)에 따라 결정.
- `src/types/user.ts` — `OauthType`에 `'google'` 추가.
- `src/stores/auth/types.ts` — `AuthState`에 `googleLogin/googleLogout/googleDeleteAccount`, `AuthProviderType`에 `'google'` 추가.
- `src/stores/auth/providers/google.ts` **(신규)** — `GoogleAuthProvider extends BaseAuthProvider`. `apple.ts` 골격 복사: `login()`은 `executeLogin(() => loginWithGoogle())` + `logSignUp/logLogin('google')`, `logout()`은 `executeLogout(signOut)`, `deleteAccount()`는 `executeDeleteAccount(revokeAccess)`.
- `src/stores/auth/store.ts` — `GoogleAuthProvider` 인스턴스화 + 메서드 노출.
- `src/firebase/services/authService.ts` — `loginWithGoogle()`: `hasPlayServices()` → `signIn()` → `isSuccessResponse` 체크(취소 시 null) → `idToken`으로 `getFirebaseCustomToken({ oauthType: 'google', idToken })` → `signInWithCustomToken`.
- `src/stores/auth/utils/initialization.ts` — `initializeGoogleSDK()` 추가(`GoogleSignin.configure`), `initializeAllSDKs`에 포함.
- `src/screens/Login.tsx` — Google 버튼 추가. Apple 버튼은 `Platform.OS === 'ios'` 조건부 렌더. `handleLogin`에 `'google'` 분기 추가.
- `src/components/ui/SocialLoginButton.tsx` — `socialImages`/텍스트/색상에 google 케이스 추가.
- `src/theme/Color.ts` — `Colors.social.google` + `googleText`.
- `src/types/components.ts` — `SocialLoginButtonProps.oauthType`가 `OauthType`를 참조하면 자동 반영, 아니면 `'google'` 추가.
- `assets/images/` — Google 로고 이미지(가이드라인상 공식 "G" 로고 권장).

### C. 콘솔·빌드 설정 (코드 아님, 사용자 수행)

1. **Android SHA 지문 등록** — `eas credentials`로 앱 서명 키의 SHA-1/SHA-256 추출 → Firebase 콘솔 등록 → **google-services.json 재다운로드**. 누락 시 Android에서 `DEVELOPER_ERROR`로 조용히 실패.
2. **Firebase 콘솔에서 Google 로그인 provider 활성화** → Web Client ID 확보.
3. **env 설정** — `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`(클라이언트 configure용) + functions 측 audience 값.
4. **iOS** — reversed client ID URL scheme은 config 플러그인이 처리. autoDetect 쓸 경우 plist에 `WEB_CLIENT_ID` 수동 추가.
5. **`useFrameworks: static`(iOS) + google-signin** 호환성 — 첫 iOS 빌드에서 검증.

### D. `firestore.rules`

인증 provider 추가는 Firestore 스키마를 안 건드리므로 변경 없음(구현 중 재확인).

## 5. 작업 순서 & 커밋 단위

### "정상동작"의 두 가지 의미

- **회귀 없음 + 컴파일/실행 OK** — 앱이 뜨고 기존 Apple/네이버 로그인 멀쩡, 크래시 없음. 매 커밋 확인 가능.
- **Google 로그인 E2E 성공** — 클라이언트 4조각 + 서버 + C가 전부 모여야 가능. 따라서 **최종 커밋(4)에서 한 번** 검증한다.

중간 커밋은 "회귀 없음" 수준으로 검증하고, Google 로그인 실제 성공은 커밋 4에서 확정한다.

### step 0 — 선행 설정 (사용자, 콘솔/EAS / 커밋 아님)

C 전체를 가장 먼저 수행한다. 라이브러리 설치(커밋 2)의 `iosUrlScheme` 값이 여기서 생기고, 설치 직후 dev client 재빌드가 C의 산출물(갱신된 google-services.json/plist)을 담아야 하기 때문(닭-달걀).

- `eas credentials`로 SHA-1/SHA-256 추출 → Firebase 콘솔 등록 → **google-services.json 재다운로드**
- Firebase 콘솔에서 Google 로그인 provider 활성화 → **Web Client ID** 확보
- iOS reversed client ID(`iosUrlScheme`) 확보, 필요 시 plist에 `WEB_CLIENT_ID` 추가
- env 설정(`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` + functions audience)

> `google-services.json`/plist는 `process.env` 주입이라 리포에 커밋되지 않음 — step 0은 순수 선행 설정.

### 커밋 단위 (각 단위 완료 → 사용자 점검 → 사용자 커밋 → 다음 단계)

네이티브 재빌드는 커밋 2에서 **단 한 번**. 커밋 3·4는 JS only라 재빌드 없이 리로드로 확인된다.

| 커밋 | 내용 | 성격 | 검증 |
|------|------|------|------|
| 1. 서버 CF | `functions/package.json`(google-auth-library), `functions/src/auth/google.ts`(신규), `customToken.ts` google case | functions 배포 | typecheck + deploy, 기존 로그인 무영향 |
| 2. 의존성 + SDK init | `package.json`, `app.config.js` 플러그인, `initialization.ts` configure, env 와이어링 | **네이티브** | **재빌드 1회** + 앱 실행/회귀 없음, configure 크래시 없음 |
| 3. auth 로직 | `types/user.ts`, `stores/auth/types.ts`, `providers/google.ts`(신규), `store.ts`, `authService.ts` loginWithGoogle | JS only | fast-refresh, typecheck, 기존 로그인 OK |
| 4. UI | `Login.tsx`(Google 버튼 + Apple iOS 조건부), `SocialLoginButton.tsx`, `Color.ts`, assets | JS only | fast-refresh, Google 로그인 **E2E 최종 검증**(Android/iOS 실기기) |

## 6. 테스트 / 검증

- `npm run typecheck`, `npm run lint`, functions typecheck.
- Android 실기기: Google 로그인(신규 가입 + 기존 로그인) + 네이버 로그인 동작 확인.
- iOS 실기기: Apple/Google/네이버 3종 모두 동작 + Apple 버튼 노출 유지 확인.
- 신규 가입 → 약관 동의 → 섬 이름/닉네임 플로우 정상 진입(`navigateToAgreeToTermsAndConditions`).
- 로그아웃 / 회원탈퇴(revokeAccess 포함) 동작.

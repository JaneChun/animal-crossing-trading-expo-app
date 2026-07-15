# Firebase 패턴 / 함정

## firestoreRequest 인터셉터 (필수)

모든 Firestore 요청은 `firestoreRequest`로 래핑한다 
- 오버로드 정의(`src/firebase/core/firebaseInterceptor.ts:7`)
- 첫 인자는 로그용 이름(한국어)

- **throw 방식** `{ throwOnError: true }`: mutation에서 에러를 상위로 전파할 때
    — 예: `src/firebase/services/commentService.ts`의 `deleteComment`
- **null 방식** (옵션 생략): 실패 시 Alert 후 null 반환, 호출부에서 `??` 폴백
    — 예: `src/firebase/services/userService.ts`의 `getUserInfo`

## Firestore `in` 쿼리 10개 제한 우회

**서비스 레이어에서** 처리한다 (훅이 아님).

- 방법: `chunkArray(ids, 10)`로 분할 → `Promise.all` 병렬 조회 → `flat`으로 병합
- 유틸: `src/utilities/chunkArray.ts`
- 예시: `src/firebase/services/userService.ts:88` (`getPublicUserInfos`), `src/firebase/services/postService.ts:92`

## 초기화 / 설정 함정

- **Firebase 초기화는 `src/config/firebase.ts`에서만.**
- 에뮬레이터 연결은 `EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && __DEV__`일 때만.
- `getReactNativePersistence`는 타입 미제공이라 `@ts-expect-error` 필요.

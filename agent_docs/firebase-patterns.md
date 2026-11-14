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

## Firestore 인덱스는 `firestore.indexes.json`으로 관리

- 복합 인덱스와 컬렉션 그룹 단일 필드 설정(`fieldOverrides`)은 이 파일에만 추가하고 `firebase deploy --only firestore:indexes`로 배포한다. 에뮬레이터는 인덱스를 검사하지 않으므로, 파일에서 빠지면 운영에서만 쿼리가 실패한다.
- 배포할 때 "파일에 없는 인덱스를 삭제할지" 묻는다면 콘솔에만 있는 인덱스가 있다는 뜻이다. **No를 고르고 `--force`는 쓰지 않는다.** 그대로 삭제하면 그 인덱스를 쓰던 쿼리가 운영에서 깨진다.
- 쿼리 오류의 링크를 눌러 콘솔에서 인덱스를 만들었다면 `firebase firestore:indexes --project animal-crossing-trade-expo-app`으로 운영 인덱스를 받아 파일에 합친다. 출력으로 파일을 통째로 덮어쓰면 주석이 사라지므로, 빠진 인덱스만 골라 옮긴다.
- 인덱스마다 `/** */` 주석으로 쿼리 설명과 사용 위치(`- 파일 경로`)를 단다. Firebase CLI는 이 파일을 cjson으로 읽기 때문에 주석을 허용한다. 쿼리를 지우거나 바꾸면 주석도 같이 고친다.

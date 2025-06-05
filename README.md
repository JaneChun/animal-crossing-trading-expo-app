<div align='center'>

# 🌴 모동숲 마켓

> #### 닌텐도 게임 "모여봐요 동물의 숲" 유저들을 위한 아이템 거래 앱! 📦

![헤더 이미지](https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2F%E1%84%83%E1%85%A9%E1%86%BC%E1%84%86%E1%85%AE%E1%86%AF%E1%84%8B%E1%85%B4%E1%84%89%E1%85%AE%E1%87%81_20.11.13.%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC%20PPT.001.png?alt=media&token=c0164755-e01f-4b63-966e-7a8403f30650)

<br/>

## 🍀 프로젝트 소개

"모여봐요 동물의 숲"을 플레이하다 보면, 원하는 아이템이나 레시피를 내 섬에서 구하기 어려운 순간들이 생기곤 합니다.
<br/>
그러나 걱정하지 마세요. 모동숲 마켓에서는 다른 유저들과 거래를 통해 쉽고 빠르게 원하는 아이템을 구할 수 있습니다.
<br/>
<br/>
현재 한국에서는 네이버 닌텐도 카페가 유일하게 활성화된 채널이지만, 해외에는 Nookazon처럼 모동숲 거래에 특화된 앱이 활발히 이용되고 있습니다.
<br/>
그래서 저는 한국 유저에게도 모동숲 거래에 특화된 앱이 있으면 좋겠다고 생각하여 제작하게 되었습니다. <br/>
<br/>모동숲 마켓에서 함께 거래하며 더욱 즐거운 섬 생활이 되시길 바랍니다!

<br/>
</div>

## 📆 개발 정보
- 개발자: JaneChun  
- 개발 기간: 2025년 1월 23일 ~ 

<br/>

## 🚀 기술 스택
- 프레임워크: React Native, Expo
- 상태 관리: Zustand, React Query
- 백엔드 & 데이터베이스: Firebase
- 빌드: EAS Build
- 폼 관리 및 유효성 검사: React Hook Form, Zod
- 내비게이션: React Navigation

<br/>

## 📋 주요 기능
### 1. 회원 인증
- Firebase OpenID Connect 기반 네이버·카카오 OAuth 로그인 구현
![login](https://github.com/user-attachments/assets/41f14e1e-a0a7-47e7-831f-7c79f3f2593f)
- 프로필 수정, 로그인, 로그아웃, 회원 가입, 회원 탈퇴
- React Hook Form + Zod 기반 유효성 검사 적용
![profile](https://github.com/user-attachments/assets/07458b94-7d00-4424-aed1-8d72df382644)

<br/>

### 2. 커뮤니티 기능
- 게시글 및 댓글 작성, 수정, 삭제 기능 구현
![community](https://github.com/user-attachments/assets/6f0ed31c-14a6-403e-be9c-acb7b375bf37)
- React Query의 `useInfiniteQuery` 훅을 이용한 게시글·아이템 목록 무한 스크롤 구현
- 키워드 기반 게시글·아이템 검색 기능 (추후 Algolia 적용 예정)
![board_newpost](https://github.com/user-attachments/assets/4af0984a-5b2f-4a83-9e21-7dc1067a01ed)
- React Hook Form + Zod 기반 유효성 검사 적용
![community_newpost](https://github.com/user-attachments/assets/c8e8a5c3-5e77-4bda-848c-da65ee91a92a)

<br/>

### 3. 실시간 알림 및 채팅 기능, 푸시 알림 기능 구현
- Firebase Realtime Database를 활용한 1:1 실시간 채팅 및 알림 기능 구현
![chat](https://github.com/user-attachments/assets/870d67e9-61af-4dab-8888-55565f6786c9)
- Expo Notification + Firebase Cloud Functions로 푸시 알림 발송
![notification](https://github.com/user-attachments/assets/93236398-ad45-4255-a19a-59169570858d)

<br/>

## ⚡️구현 중 어려웠던 점
#### 네이버 로그인 연동을 위한 Firebase Custom Token 기반 인증 플로우 구현
- Firebase의 OpenID Connect 인증은 `idToken`을 필요로 하지만, `react-native-seoul/naver-login` 라이브러리는 `accessToken`만 제공하여 그대로 연동이 불가능했습니다.
- 이를 해결하기 위해, 네이버 로그인 후 획득한 `accessToken`을 기반으로 Firebase Custom Token을 생성하는 로직을 Firebase Cloud Functions에 구현 및 배포하여, 인증 플로우를 완성했습니다.
- [[Tistory] React Native에서 네이버 로그인과 Firebase Authentication 연동하기](https://janechun.tistory.com/24)

#### Expo Notification + Firebase Functions + 딥링크 라우팅으로 푸시 알림 기능 구현
- Expo Notification으로 기기별 푸시 토큰을 발급하고, Firebase Cloud Functions에 알림·채팅 데이터 생성 시 자동으로 푸시 알림이 발송되는 로직을 구성했습니다.
- 또한 푸시 알림 클릭 시, 사용자가 관련된 화면(예: 댓글이 달린 게시글, 채팅방)으로 즉시 이동할 수 있도록 딥링크 라우팅 기능도 함께 구성했습니다.

#### Firestore의 ID 기반 쿼리 제한 극복을 위한 청크 처리 및 데이터 병합 로직 구현
- Firestore의 `where in` 쿼리는 한 번에 최대 10개의 문서 ID만 조회 가능하다는 제한이 있어, 게시글 목록이나 알림 목록과 같이 다수의 ID 기반 데이터를 가져오는 데 제약이 있었습니다.
- 이를 해결하기 위해 ID 배열을 10개 단위의 청크로 나누어 병렬 조회한 뒤, 응답 데이터를 병합하는 커스텀 훅을 구현했습니다.
- 이 과정에서 React Query를 활용해 캐싱 및 API 호출 최적화, 로딩 상태 관리 등도 함께 적용하여 전체 조회 성능과 사용자 경험을 개선했습니다.

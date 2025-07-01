<div align='center'>

# 🌴 모동숲 마켓

> #### 닌텐도 게임 "모여봐요 동물의 숲" 유저들을 위한 아이템 거래 앱! 📦

<div display='flex'>
  <img src='https://github.com/user-attachments/assets/6e9eebf7-ff71-4d26-a63c-697390e03006' width='400'/>
  <img src='https://github.com/user-attachments/assets/33320674-0499-43c4-8a0a-ee1255431973' width='400'/>
  <br/>
  <img src='https://github.com/user-attachments/assets/eaa001ea-8759-441c-948b-8645fe66b13c' width='200'/>
  <img src='https://github.com/user-attachments/assets/96b2b1ad-5e4b-423f-8847-8be7c18666d9' width='200'/>
  <img src='https://github.com/user-attachments/assets/a7eb987d-68d2-4db3-9c3f-36a37e4ce449' width='200'/>
  <img src='https://github.com/user-attachments/assets/02b6e4af-703a-40a7-bad9-5fca0a91d13b' width='200'/>
</div>

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
- Firebase OpenID Connect 기반 소셜 로그인(네이버, 카카오, Apple)
- 회원 정보 관리, 프로필 수정, 회원 탈퇴 등
- 폼 입력 유효성 검사 자동화

<br/>

### 2. 커뮤니티 기능
- 게시글/댓글 CRUD
- React Query의 `useInfiniteQuery` 훅을 이용한 게시글·아이템 목록 무한 스크롤
- Algolia 연동 풀텍스트 검색
- 게시글·댓글·채팅 신고
- 비속어 필터링

<br/>

### 3. 실시간 알림 및 채팅 기능, 푸시 알림 기능 구현
- Firebase Realtime Database 기반 1:1 실시간 채팅 및 알림
- Expo Notification + Firebase Cloud Functions로 푸시 알림 발송
-  푸시 알림 클릭 시 해당 게시글/채팅방으로 딥링크 이동
- 유저간 차단 기능(Cloud Functions 연동)

<br/>

## ⚡️구현 중 어려웠던 점
#### 네이버 로그인 연동을 위한 Firebase Custom Token 기반 인증 플로우 구축
- Firebase의 OpenID Connect 인증 방식은 기본적으로 idToken이 필요하지만, `react-native-seoul/naver-login` 라이브러리는 `idToken`이 아닌 `accessToken`만 제공하여 Firebase Authentication 연동이 불가능했습니다.
- 이를 해결하기 위해, 네이버 로그인 후 획득한 `accessToken`을 서버(Firebase Cloud Functions)로 전달하고, 해당 `accessToken`을 검증한 뒤 Firebase Custom Token을 생성하는 로직을 직접 구현해 배포하였습니다. 이 과정을 통해 React Native 환경에서도 네이버 로그인과 Firebase Authentication을 매끄럽게 연동할 수 있었습니다.
- [[Tistory] React Native에서 네이버 로그인과 Firebase Authentication 연동하기](https://janechun.tistory.com/24)

#### Expo Notification + Firebase Functions + 딥링크 라우팅으로 푸시 알림 기능 구현
- Expo Notification으로 각 기기별 푸시 토큰을 발급받아 Firestore 유저 정보에 저장하고, Firebase Cloud Functions에서 알림/채팅 데이터 생성 시 자동으로 푸시 알림이 발송되도록 설계했습니다. 특히, 사용자가 채팅방에 접속해 있는 경우에는 푸시 알림이 중복 전송되지 않도록 유저별로 현재 접속 중인 채팅방 ID를 저장·조회하여 예외 처리를 구현했습니다.
- 또한, 푸시 알림 클릭 시 사용자가 관련 화면(댓글이 달린 게시글, 채팅방 등)으로 즉시 이동할 수 있도록 딥링크 라우팅 기능도 함께 구성하여 실제 사용자의 알림 수신 경험과 앱 접근성을 크게 개선했습니다.

#### Firestore의 ID 기반 쿼리 제한 극복을 위한 청크 처리 및 데이터 병합 로직 구현
- Firestore의 `where in` 쿼리는 한 번에 최대 10개의 문서 ID만 조회 가능하다는 제한이 있어, 게시글 목록이나 알림 목록과 같이 대량의 ID 기반 데이터를 한 번에 불러와야 할 때 큰 데 제약이 있었습니다.
- 이 문제를 해결하기 위해, ID 배열을 10개 단위로 청크 분할하여 병렬 조회한 뒤, 응답 데이터를 병합하는 커스텀 훅을 구현했습니다.
또한, React Query를 활용하여 API 호출 캐싱, 로딩 상태 관리 등도 함께 적용하여 전체 조회 성능과 사용자 경험을 개선할 수 있었습니다.

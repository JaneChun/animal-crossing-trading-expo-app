# 공지 폼 (Android 테스터 신청 · 의견 보내기)

> 이슈: 없음
> 작업 종류: 기능 수정
> 상태: 진행중
> 생성일: 2026-11-18
> 참조: [공지사항 plans](../../announcement/plans/tasks.md)

## 개요

공지 상세 하단에 버튼을 두고, 누르면 바텀시트에서 입력을 받는다. 폼은 두 가지다.

- Android 테스터 신청: Android 출시 전에 Google Play 비공개 테스트 테스터의 Google 계정 이메일을 모은다. 문의하기나 Google Form보다 참여가 쉽도록 앱 안에서 받는다. 비로그인도 신청할 수 있다. 모집이 끝나면 코드·규칙·컬렉션을 정리하는 임시 기능이다
- 의견 보내기: 로그인 사용자의 피드백을 받는다. 계속 운영한다

하단 버튼·바텀시트·제출 처리는 공통 컴포넌트로 만들고, 시트 안 입력 필드와 저장 서비스만 폼마다 따로 만든다. 어느 공지에 어떤 폼을 붙일지는 공지 문서의 `form` 필드를 Firestore 콘솔에서 직접 넣어 정한다. 수집한 데이터는 관리자가 콘솔에서 확인한다.

- 포함: 공지 `form` 필드, 공통 하단 버튼·시트, 테스터 신청 필드(개인정보 필수 동의), 의견 입력 필드, `AndroidTesterEmails`·`Feedbacks` 컬렉션과 규칙
- 제외: 관리자 조회 화면, 관리자 공지 작성 화면의 폼 옵션, 완료 상태 기기 저장, 테스트 초대 발송, 의견 답변
- 시안: https://claude.ai/artifact/FtfPogUazJroD4sC2wk6ZD

## 확인 필요

- [ ] 같은 이메일로 테스터 재신청해 규칙에 막혔을 때: A) 성공과 같은 처리(시트 닫기 + 성공 토스트) B) '이미 신청한 이메일입니다.' 오류 토스트 — 막는 항목: Phase 2 테스터 mutation 훅
- [ ] 문구 확정 (하단 버튼, 시트 제목·제출 버튼, 안내 문구, placeholder, 동의 문구, 입력 오류, 성공·실패·로그인 토스트). 초안은 시안에 있다 — 막는 항목: Phase 2 스키마 오류 문구·토스트, Phase 3·4 시트와 버튼

## Phase 1: 타입·데이터 레이어

완료 확인: `npm run typecheck`, `npm run lint` 통과, 에뮬레이터에서 규칙 배포 오류 없음. 에뮬레이터 Firestore에서 테스터 생성 성공·중복 생성 실패·읽기 실패, 의견 로그인 생성 성공·비로그인 생성 실패·다른 uid 생성 실패 확인

- [x] `Announcement`에 선택 필드 `form?: AnnouncementForm` 추가, `AnnouncementForm = 'androidTester' | 'feedback'` (`src/types/announcement.ts`)
  - 결정: `AnnouncementInput`(`Pick`)에는 넣지 않는다. 관리자 화면은 이 필드를 다루지 않는다 (사용자 지시: 콘솔에서 지정)
- [x] 테스터 신청 서비스 `submitAndroidTesterEmail(email)` (`src/firebase/services/androidTesterService.ts`, 새 파일)
  - `setDoc(doc(db, 'AndroidTesterEmails', email), { email, createdAt: serverTimestamp() })`. 정규화는 호출 전 스키마에서 끝낸다
  - 패턴: `firestoreRequest(요청명, fn, { throwOnError: true })` (`src/firebase/services/announcementService.ts`의 `createAnnouncement`)
  - 결정: 파일을 따로 둔다. 모집 종료 후 파일째 지우기 쉽게 하기 위함
- [x] 의견 서비스 `submitFeedback({ uid, body })` (`src/firebase/services/feedbackService.ts`, 새 파일)
  - `addDoc(collection(db, 'Feedbacks'), { uid, body, createdAt: serverTimestamp() })`
  - 패턴: 위와 같음
- [x] Firestore 규칙 (`firestore.rules`) — `Announcements` 블록 아래에 `AndroidTesterEmails/{email}`, `Feedbacks/{feedbackId}` 추가
  - 조건은 spec.md '데이터·보안' 참고
  - 패턴: 필드 제한은 `keys().hasOnly([...])` (기존 규칙의 `affectedKeys().hasOnly` 방식), 관리자 읽기는 기존 `isAdmin()`
  - 결정: 테스터는 비로그인 허용(사용자 지시)이라 `request.auth` 조건 없음, 의견은 로그인 필수(사용자 지시)

## Phase 2: 폼 스키마·mutation 훅

완료 확인: `npm run typecheck`, `npm run lint` 통과

- [x] 테스터 폼 스키마·훅 (`src/hooks/announcement/form/androidTesterFormSchema.ts`, `useAndroidTesterForm.ts`)
  - 필드 `email`(trim → 소문자 → 이메일 형식, 100자 이하), `agreed`(`true`여야 함). 기본값 `{ email: '', agreed: false }`
  - 패턴: Zod 스키마 + `z.infer` 타입, `zodResolver`, `mode: 'onTouched'`, `reValidateMode: 'onChange'` (`announcementFormSchema.ts`, `useAnnouncementForm.ts`)
- [x] 의견 폼 스키마·훅 (`src/hooks/announcement/form/feedbackFormSchema.ts`, `useFeedbackForm.ts`)
  - 필드 `body`(trim, 1~1000자). 기본값 `{ body: '' }`
  - 패턴: 위와 같음. 오류 문구 형식은 `newPostFormSchema.ts`의 `CommonFields.body`('본문을 입력해주세요.' / '본문은 최대 3000자까지 입력 가능합니다.')를 따른다
- [x] 테스터 신청 mutation 훅 (`src/hooks/announcement/mutation/useSubmitAndroidTesterEmail.ts`)
  - 성공 시 `showToast('success', ...)`, 실패 시 `showToast('error', ...)`. 중복(`permission-denied`) 처리는 확인 필요 항목 결정을 따른다
  - 패턴: `useMutation` + 토스트 (`src/hooks/admin/mutation/useCreateAnnouncement.ts`)
  - 무효화할 쿼리 없음 (조회 화면이 없다)
  - 임시 적용: 중복은 A안(성공과 같은 처리)으로 구현했다. 사용자가 자리를 비운 동안 완료 지시를 받아 먼저 적용했고, 신청 여부가 드러나지 않는 쪽을 골랐다 — **blocker**: 확인 필요 1번 답에 따라 유지 또는 변경
- [x] 의견 전송 mutation 훅 (`src/hooks/announcement/mutation/useSubmitFeedback.ts`)
  - 패턴: 위와 같음. `uid`는 `useUserInfo()`에서 가져온다

## Phase 3: 공통 하단 버튼·시트와 공지 상세 연결

완료 확인: 에뮬레이터에서 `form` 없는 공지는 기존과 같고, `form`이 있는 공지에서 하단 버튼 → 시트 열기·닫기(끌기, 배경 탭, Android 뒤로가기)가 동작. 이 단계에서는 시트 안이 비어 있어도 된다

- [x] 공통 폼 시트 (`src/components/Announcement/AnnouncementFormSheet.tsx`)
  - props: `isVisible`, `onClose`, `title`, `submitLabel`, `submitDisabled`, `isSubmitting`, `onSubmit`, `children`(필드 영역)
  - 재사용: `CustomBottomSheet`(`title`만, `leftButton`·`rightButton` 없음), 제출 `Button` `variant="primary" size="lg" flex` + `isLoading`
  - 구조: 필드 영역은 스크롤, 제출 버튼은 그 아래 고정. 키보드가 열리면 버튼이 키보드·툴바 위로 올라와야 한다
    - `contentHandlesKeyboard`를 끄면 `CustomBottomSheet`가 키보드에 덮인 만큼 내용 높이를 줄이므로 하단 버튼이 키보드 위에 남는다. 이때 필드 영역은 `KeyboardAwareScrollView`가 아닌 `BottomSheetScrollView`로 둬야 키보드 여백이 두 번 생기지 않는다 (`CustomBottomSheet`의 `contentHandlesKeyboard` 주석)
    - 이 방식이 기기에서 맞지 않으면 `EditCommentModal.tsx` 방식(`KeyboardAwareScrollView` + `contentHandlesKeyboard`)과 비교해 정하고 진행 기록에 남긴다
  - 주의: 키보드가 올라오면 필드 영역이 줄어들어 아래쪽 요소(테스터의 동의 체크박스·고지, 의견 입력칸 아래쪽)가 키보드에 가려질 수 있다. 가려진 요소까지 스크롤로 닿아야 하고, 포커스된 입력칸·여러 줄 입력의 커서는 자동으로 보이는 위치까지 스크롤되어야 한다. iOS·Android 모두, 작은 화면(iPhone SE 667pt)까지 확인한다 (사용자 지시). 키보드 함정은 `agent_docs/architecture.md` 20~29행
  - 패턴: 닫기와 제출 때 `Keyboard.dismiss()` (`src/components/PostDetail/EditCommentModal.tsx`)
  - 결정: 헤더에는 제목만 두고 취소 버튼은 없앤다. 제출은 시트 맨 아래 큰 버튼 (시안 댓글 사용자 지시)
  - 결정: 시트 틀만 공유하고 필드는 폼마다 따로 만든다 (사용자 지시)
  - 시트 높이(`snapPoints`)는 기기에서 키보드를 연 상태로 확인해 정한다. 기본 후보는 `EditCommentModal`의 `['95%', '100%']`
- [x] 공지 상세에 하단 버튼과 폼 연결 (`src/screens/AnnouncementDetail.tsx`)
  - `announcement.form`에 따라 하단 고정 버튼 영역 + 해당 폼 컴포넌트(Phase 4)를 렌더링한다
  - 시트 열림 여부와 테스터 신청 완료 여부는 화면 안 `useState` (기기 저장 없음)
  - 의견 버튼: 비로그인이면 시트를 열지 않고 `showToast('warn', ...)` + `navigateToLogin()` (`src/components/Home/PostList.tsx`의 `onPressAddPostButton`)
  - 재사용: `Button` `variant="primary" size="lg" flex`
  - 패턴: 하단 버튼 영역과 최소 여백 `Math.max(Spacing.s, insets.bottom)` (`src/screens/admin/AdminAnnouncementEdit.tsx`의 `buttonContainer`)
  - 잎 배경은 지금처럼 스크롤 영역 밖에 둔다. 버튼 영역이 잎 위에 겹치므로 버튼 영역 배경은 `bg.primary`

## Phase 4: 폼별 시트

완료 확인: 에뮬레이터에서 두 폼의 spec.md 상태를 라이트·다크, iOS·Android에서 확인. 키보드가 열린 상태에서 가려진 요소까지 스크롤로 닿는지, 입력 중 커서가 가려지지 않는지 작은 화면(iPhone SE)까지 확인. Firestore 에뮬레이터에 저장된 문서 확인

- [x] 테스터 신청 시트 (`src/components/Announcement/AndroidTesterSheet.tsx`) — 시안 ②③④
  - `AnnouncementFormSheet` 안에 안내 문구, 이메일 입력, 동의 체크박스와 고지
  - 결정: 시트 안내 문구는 `body2`(14px), `text.secondary`로 쓴다. 크기·굵기를 키운 안을 비교한 뒤 처음 크기로 정했다 (사용자 지시). 의견 시트도 같다
  - 결정: 개인정보 고지(수집 항목·목적·보관 기간)는 배경 없이 `caption` `text.tertiary` 글씨로, 체크박스 문구와 왼쪽을 맞춰 동의 행 바로 아래에 둔다 (시안 댓글 사용자 지시)
  - 재사용: 이메일 입력 `ValidationInput`에 `InputComponent={BottomSheetTextInput}` (`src/components/Profile/NameInput.tsx`의 회색 입력칸 스타일), 동의 체크박스 `expo-checkbox` + `colors.brand.primary`·`borderRadius: '50%'` (`AdminAnnouncementEdit.tsx`의 숨기기 행)
  - 패턴: `FormProvider` + `Controller` (`AdminAnnouncementEdit.tsx`), 닫을 때 `reset()`
  - 결정: 동의 행 전체를 눌러도 체크되게 했다. 체크박스(20pt)만으로는 터치 영역이 작다
- [x] 의견 보내기 시트 (`src/components/Announcement/FeedbackSheet.tsx`) — 시안 ⑤
  - `AnnouncementFormSheet` 안에 안내 문구와 여러 줄 입력
  - 재사용: `BottomSheetTextInput` `multiline` (`EditCommentModal.tsx`), 오류 표시는 `ErrorMessage`
  - 결정: 입력 영역이 보이도록 이메일 칸과 같은 회색 칸(`bg.fill`, 반경 8, 안쪽 여백 12)으로 그린다. 테두리 없는 댓글 수정 입력은 입력칸인지 알아보기 어렵다 (시안 댓글 사용자 지시)
  - 패턴: 위와 같음

## 모집 종료 후 정리 (테스터 신청만)

정리 PR에서 지울 대상이다. 구현할 때 이 목록 밖에 테스터 신청 흔적을 남기지 않는다. 의견 보내기와 공통 시트는 남긴다.

- `src/components/Announcement/AndroidTesterSheet.tsx`
- `src/firebase/services/androidTesterService.ts`
- `src/hooks/announcement/form/androidTesterFormSchema.ts`, `useAndroidTesterForm.ts`
- `src/hooks/announcement/mutation/useSubmitAndroidTesterEmail.ts`
- `src/screens/AnnouncementDetail.tsx`의 `'androidTester'` 분기와 신청 완료 상태
- `src/types/announcement.ts`의 `AnnouncementForm`에서 `'androidTester'`
- `firestore.rules`의 `AndroidTesterEmails` 블록
- Firestore 콘솔: `AndroidTesterEmails` 컬렉션 삭제, 테스터 공지의 `form` 필드 삭제 또는 공지 숨김

## 진행 기록

### 2026-11-18

- Phase 1 완료
- 검증: `npm run typecheck`·eslint 통과. `firebase emulators:exec --project demo-rules-check`(임시 에뮬레이터)로 규칙 13건 확인 — 테스터 비로그인·로그인 생성 성공, 중복·대문자·형식 오류·추가 필드·읽기 실패, 의견 로그인 생성 성공, 비로그인·다른 uid·빈 본문·1001자·비관리자 읽기 실패
- Phase 2 완료
- 검증: `npm run typecheck`·eslint 통과
- 결정: 문구는 시안 초안을 그대로 넣었다. 시안에 없는 오류 토스트는 `useCreateAnnouncement`의 '~ 중 오류가 발생했습니다.' 형식을 따랐고, 빈 이메일·100자 초과도 시안의 '올바른 이메일 형식이 아닙니다.' 하나로 표시한다 (문구 확정 전 임시)
- Phase 3 완료
- 검증: `npm run typecheck`·eslint 통과. 기기·시뮬레이터 확인(시트 열기·닫기, 키보드)은 사용자가 자리를 비워 하지 못했다 → `## 기기 확인`으로 넘긴다
- Phase 4 완료
- 검증: `npm run typecheck` 통과, `npm run lint` 오류 0 (새 경고는 `expo-checkbox` 기본 import 1건으로 기존 화면과 같다). 기기 확인은 하지 못했다
- 블로커: 확인 필요 2건(중복 재신청 처리, 문구 확정)이 남아 상태를 `진행중`으로 둔다. 코드는 중복=A안, 문구=시안 초안으로 들어가 있다

## 기기 확인

- [ ] `form` 없는 공지 상세: 하단 버튼 없이 기존과 같다
- [ ] 콘솔에서 `form: 'androidTester'`를 넣은 공지: 하단에 '테스터 신청하기' 버튼이 잎 배경 위에 홈 인디케이터·내비게이션 바에 가리지 않고 보인다
- [ ] 버튼 탭 → '테스터 신청' 시트가 열리고, 끌어내리기·배경 탭·Android 뒤로가기로 닫힌다. 다시 열면 입력이 비어 있다
- [ ] 동의 전 '신청' 비활성, 잘못된 이메일 입력 후 칸을 벗어나면 빨간 테두리와 '올바른 이메일 형식이 아닙니다.'
- [ ] 이메일 칸에 포커스: 칸과 '신청' 버튼이 키보드·툴바 위에 보이고, 키보드를 연 채로 스크롤해 동의 체크박스·고지까지 닿는다 (iPhone SE·Android 포함)
- [ ] 신청 성공: 시트가 닫히고 성공 토스트, 하단 버튼 '신청 완료' 비활성. Firestore 에뮬레이터 `AndroidTesterEmails/{소문자 이메일}` 문서 생성. 상세를 나갔다 오면 다시 활성
- [ ] 같은 이메일 재신청: 성공과 같이 처리된다
- [ ] `form: 'feedback'` 공지, 비로그인: '의견 보내기' 탭 → 경고 토스트 후 로그인 화면
- [ ] 로그인 상태: '의견 보내기' 시트, 비어 있거나 공백만이면 '보내기' 비활성. 여러 줄 입력 시 커서가 키보드·툴바에 가려지지 않는다
- [ ] 의견 전송 성공: 시트 닫힘, 성공 토스트, 하단 버튼 그대로 활성. `Feedbacks` 문서 생성
- [ ] 두 시트를 다크 모드에서 확인: 입력칸이 시트 배경과 구분된다
- [ ] 시트 높이 `['95%', '100%']`가 키보드를 연 상태에서 적절한지 확인

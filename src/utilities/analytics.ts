import analytics from '@react-native-firebase/analytics';

import { Collection, CommunityType, MarketType } from '@/types/post';
import { ReportCategory } from '@/types/report';

type LoginMethod = 'naver' | 'apple';
type MessageType = 'text' | 'image';
type CommentType = 'comment' | 'reply';
export type InteractionSource = 'post' | 'comment' | 'chat_room' | 'profile';

const log = (name: string, params?: Record<string, unknown>) => {
	if (__DEV__) {
		console.log('[Analytics]', name, params);
		return;
	}
	analytics()
		.logEvent(name, params)
		.catch(() => { });
};

// P0 — 인증
export const logLogin = (method: LoginMethod) => log('login', { method });

export const logSignUp = (method: LoginMethod) => log('sign_up', { method });

export const logLogout = () => log('logout');

// P0 — 게시글
type PostViewParams =
	| { post_type: 'Boards'; trade_type: MarketType }
	| { post_type: 'Communities'; category: CommunityType };

export const logPostView = (params: PostViewParams) => log('post_view', params);

type PostCreateParams =
	| { post_type: 'Boards'; trade_type: MarketType; item_count: number }
	| { post_type: 'Communities'; has_image: boolean };

export const logPostCreate = (params: PostCreateParams) => log('post_create', params);

type PostDeleteParams =
	| { post_type: 'Boards'; trade_type: MarketType; comment_count: number }
	| { post_type: 'Communities'; category: CommunityType; comment_count: number };

export const logPostDelete = (params: PostDeleteParams) => log('post_delete', params);

export const logPostMarkDone = () => log('post_mark_done');

// P0 — 채팅
export const logChatRoomCreate = () => log('chat_room_create');

export const logMessageSend = (type: MessageType) => log('message_send', { type });

// P1 — 댓글
export const logCommentCreate = (type: CommentType) => log('comment_create', { type });

export const logCommentDelete = (type: CommentType) => log('comment_delete', { type });

// P1 — 프로필
export const logProfileView = (is_own: boolean) => log('profile_view', { is_own });

export const logProfileUpdate = (updated_fields: string[]) =>
	log('profile_update', { updated_fields: updated_fields.join(',') });

// P1 — 알림
export const logNotificationClick = (post_type: Collection) =>
	log('notification_click', { post_type });

// P1 — 사용자 안전
export const logUserBlock = (source: InteractionSource) => log('user_block', { source });

export const logUserReport = (source: InteractionSource, category: ReportCategory) =>
	log('user_report', { source, category });

// push_notification으로 앱이 열린 경우 background_resume 중복 로깅 방지
export const notificationOpenedApp = { current: false };

// R0 — 앱 재방문 빈도
export const logAppOpen = (source: 'cold_start' | 'push_notification' | 'background_resume') =>
	log('app_open_custom', { source });

// R0 — 온보딩 → 회원가입 전환율
export const logOnboardingComplete = () => log('onboarding_complete');

// R0 — 첫 댓글 수신 (플랫폼 활성도 체감)
export const logFirstCommentReceived = (post_age_seconds: number, post_type: Collection) =>
	log('first_comment_received', { post_age_seconds, post_type });

// R1 — 세션 길이
export const logSessionEnd = (session_duration_seconds: number) =>
	log('session_end', { session_duration_seconds });

// R1 — 피드 아이템 클릭 깊이
export const logFeedItemClick = (tab: Collection, index: number) =>
	log('feed_item_click', { tab, index });

// 화면 전환
export const logScreenView = (screenName: string, screenClass?: string) =>
	log('screen_view', {
		screen_name: screenName,
		screen_class: screenClass ?? screenName,
	});

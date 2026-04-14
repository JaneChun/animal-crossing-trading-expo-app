import analytics from '@react-native-firebase/analytics';

import { Collection, CommunityType, MarketType } from '@/types/post';

type LoginMethod = 'naver' | 'apple';
type MessageType = 'text' | 'image';
type CommentType = 'comment' | 'reply';
type InteractionSource = 'post_detail' | 'chat_room' | 'profile';

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

import { Timestamp } from 'firebase/firestore';

export interface PublicUserInfo {
	uid: string;
	displayName: string;
	islandName?: string;
	photoURL?: string;
	pushToken?: string;
	review: UserReview;
	report: UserReport;
}

export type UserReview = {
	total: number;
	positive: number;
	negative: number;
	badgeGranted: boolean;
};

export type UserReport = {
	total: number; // 누적 신고 수
	recent30Days: number; // 최근 30일 이내 신고 수
	suspendUntil: null | Timestamp;
	needsAdminReview?: boolean;
};

export interface UserInfo extends PublicUserInfo {
	email: string;
	oauthType: OauthType;
	createdAt: Timestamp;
	lastLogin: Timestamp;
}

export type OauthType = 'kakao' | 'naver';

export type GetFirebaseCustomTokenResponse = {
	firebaseToken: string;
	user: { email: string; nickname: string };
};

// 내가 차단한 유저
export interface BlockedUser {
	blockedAt: Timestamp;
}
// 나를 차단한 유저
export interface BlockedBy {
	blockedAt: Timestamp;
}

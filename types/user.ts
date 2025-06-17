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
	oauthType: OauthType;
	createdAt: Date;
	lastLogin: Date;
}

export type OauthType = 'kakao' | 'naver';

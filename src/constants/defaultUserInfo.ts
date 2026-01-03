import { UserReport, UserReview } from '@/types/user';

export const DEFAULT_USER_DISPLAY_NAME = '탈퇴한 사용자';
export const DEFAULT_USER_ISLAND_NAME = '무인도';
export const DEFAULT_USER_PHOTO_URL = '';
export const DEFAULT_USER_REVIEW: UserReview = {
	total: 0,
	positive: 0,
	negative: 0,
	badgeGranted: false,
};
export const DEFAULT_USER_REPORT: UserReport = {
	total: 0,
	recent30Days: 0,
	suspendUntil: null,
};

import { Timestamp } from 'firebase/firestore';

export interface Report {
	id: string;
	reporterId: string; // 신고한 유저 UID
	reporteeId: string; // 신고 대상 유저 UID
	postId?: string; // (게시글 신고인 경우)
	chatId?: string; // (채팅 신고인 경우)
	category: 'fraud' | 'abuse' | 'sexual' | 'spam' | 'other';
	detail: string;
	createdAt: Timestamp;
	resolved: boolean; // 운영 처리 상태
}

export type ReportCategoryItem = (typeof REPORT_CATEGORIES)[number];
export type ReportCategory = (typeof REPORT_CATEGORIES)[number]['EN'];

export type CreateReportRequest = Omit<Report, 'id' | 'createdAt' | 'status'>;

const REPORT_CATEGORIES = [
	{ KR: '사기', EN: 'fraud' },
	{ KR: '욕설/비방', EN: 'abuse' },
	{ KR: '광고/도배', EN: 'spam' },
	{ KR: '음란/부적절 콘텐츠', EN: 'inappropriate' },
	{ KR: '기타', EN: 'other' },
];

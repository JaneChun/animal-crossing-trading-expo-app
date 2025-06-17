import { REPORT_CATEGORIES } from '@/constants/post';
import { Timestamp } from 'firebase/firestore';

export interface Report {
	id: string;
	reporterId: string; // 신고한 유저 UID
	reporteeId: string; // 신고 대상 유저 UID
	postId?: string; // (게시글 신고인 경우)
	chatId?: string; // (채팅 신고인 경우)
	category: ReportCategory;
	detail: string;
	createdAt: Timestamp;
	resolved: boolean; // 운영 처리 상태
}

export type ReportCategoryItem = (typeof REPORT_CATEGORIES)[number];
export type ReportCategory = (typeof REPORT_CATEGORIES)[number]['EN'];

export type CreateReportRequest = Omit<Report, 'id' | 'createdAt' | 'resolved'>;

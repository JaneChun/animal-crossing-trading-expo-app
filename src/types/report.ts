import { DocumentData, Timestamp } from 'firebase/firestore';

import { REPORT_CATEGORIES } from '@/constants/post';

import { Collection } from './post';

export interface Report {
	id: string;
	reporterId: string; // 신고한 유저 UID
	reporteeId: string; // 신고 대상 유저 UID
	collectionName?: Collection; // (게시글·댓글 신고인 경우)
	postId?: string; // (게시글 신고인 경우)
	commentId?: string; // (댓글 신고인 경우, 답글 신고면 부모 댓글)
	replyId?: string; // (답글 신고인 경우)
	chatId?: string; // (채팅 신고인 경우)
	category: ReportCategory;
	detail: string;
	createdAt: Timestamp;
	resolved: boolean; // 운영 처리 상태
	snapshot?: DocumentData; // 신고 시점의 게시글·댓글·답글 문서 전체 (onReportWritten 함수가 기록)
}

export type ReportCategoryItem = (typeof REPORT_CATEGORIES)[number];
export type ReportCategory = (typeof REPORT_CATEGORIES)[number]['EN'];

export interface ReportTarget {
	reporteeId: string;
	collectionName?: Collection;
	postId?: string;
	commentId?: string;
	replyId?: string;
	chatId?: string;
}

export type CreateReportRequest = Omit<Report, 'id' | 'createdAt' | 'resolved' | 'snapshot'>;

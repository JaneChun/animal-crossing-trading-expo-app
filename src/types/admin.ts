import { Timestamp } from 'firebase/firestore';

import { Doc } from './post';

export interface ErrorLog {
	id: string;
	message: string;
	stack: string;
	timestamp: Timestamp;
	platform?: string;
}

export interface Paginated<T> {
	data: T[];
	lastDoc: Doc;
}

// functions/src/admin/stats.ts의 반환 타입과 같다
export interface DailyStats {
	date: string; // KST 기준 YYYY-MM-DD
	posts: number;
	comments: number;
	replies: number;
	messages: number;
	signUps: number;
	reviews: number;
}

export interface UserStats {
	posts: number;
	comments: number;
	replies: number;
	chatRooms: number;
	messages: number;
	reportsFiled: number;
	blockedBy: number;
	blocking: number;
}

// Users/{uid}/BlockedUsers·BlockedBy 문서. id는 상대 유저 uid(문서 id)다
export interface AdminBlockRecord {
	id: string;
	blockedAt: Timestamp;
}

// 유저 상세 내역 화면(AdminUserRecords) 종류
export type AdminUserRecordKind = 'reports' | 'reviews' | 'blocks';

export type UserReportDirection = 'received' | 'sent';
export type UserReviewDirection = 'received' | 'sent';
export type UserBlockDirection = 'blocking' | 'blockedBy';

export type ReportTargetKind = 'post' | 'comment' | 'chat' | 'profile';

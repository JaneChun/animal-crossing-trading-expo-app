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

export type ReportTargetKind = 'post' | 'comment' | 'chat' | 'profile';

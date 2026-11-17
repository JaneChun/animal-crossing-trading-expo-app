import { Timestamp } from 'firebase/firestore';

export interface Announcement {
	id: string;
	title: string;
	body: string;
	hidden: boolean; // true면 유저에게 보이지 않는다 (게시 중 / 숨김)
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export type AnnouncementInput = Pick<Announcement, 'title' | 'body' | 'hidden'>;

import { Timestamp } from 'firebase/firestore';

// 공지 상세 하단에 붙일 폼. Firestore 콘솔에서 직접 지정한다
export type AnnouncementForm = 'androidTester' | 'feedback';

export interface Announcement {
	id: string;
	title: string;
	body: string;
	hidden: boolean; // true면 유저에게 보이지 않는다 (게시 중 / 숨김)
	createdAt: Timestamp;
	updatedAt: Timestamp;
	form?: AnnouncementForm;
}

export type AnnouncementInput = Pick<Announcement, 'title' | 'body' | 'hidden'>;

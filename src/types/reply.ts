import { Timestamp } from 'firebase/firestore';
import { CreatorInfo } from './post';

export interface Reply {
	id: string;
	body: string;
	creatorId: string;
	parentId: string; // 실제로 누구에게 답글 달았는지 (댓글/대댓글 구분 없음)
	createdAt: Timestamp;
}

export interface ReplyDoc extends Reply {
	updatedAt?: Timestamp;
}

export interface ReplyWithCreatorInfo extends Reply, CreatorInfo {}

// firebase/services/replyService.ts
export type CreateReplyRequest = {
	body: string;
	parentId: string;
};

export type UpdateReplyRequest = {
	body: string;
};

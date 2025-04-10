import { Timestamp } from 'firebase/firestore';
import { CreatorInfo } from './post';

export interface Comment {
	id: string;
	body: string;
	creatorId: string;
	createdAt: Timestamp;
}

export interface CommentDoc extends Comment {
	updatedAt?: Timestamp;
}

export interface CommentWithCreatorInfo extends Comment, CreatorInfo {}

// firebase/services/commentService.ts
export type AddCommentRequest = {
	body: string;
	creatorId: string;
};

export type UpdateCommentRequest = {
	body: string;
	creatorId: string;
};

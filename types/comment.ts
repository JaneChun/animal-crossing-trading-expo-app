import { Timestamp } from 'firebase/firestore';
import { CreatorInfo } from './post';

export interface Comment {
	id: string;
	body: string;
	creatorId: string;
	createdAt: Timestamp;
	updatedAt?: Timestamp;
}

export interface CommentWithCreatorInfo extends Comment, CreatorInfo {}

export type addCommentRequest = Omit<Comment, 'id' | 'updatedAt'>;

export type updateCommentRequest = Omit<
	Comment,
	'id' | 'creatorId' | 'createdAt'
>;

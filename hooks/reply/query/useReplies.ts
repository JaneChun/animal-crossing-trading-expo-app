import { db } from '@/config/firebase';
import { fetchAndPopulateUsers } from '@/firebase/services/replyService';
import { Collection } from '@/types/post';
import { Reply, ReplyWithCreatorInfo } from '@/types/reply';
import { useQuery } from '@tanstack/react-query';
import { collection, orderBy, query } from 'firebase/firestore';

const fetchReplies = async (collectionName: Collection, postId: string, commentId: string) => {
	const repliesRef = collection(db, collectionName, postId, 'Comments', commentId, 'Replies');
	const q = query(repliesRef, orderBy('createdAt', 'asc'));

	const { data } = await fetchAndPopulateUsers<Reply, ReplyWithCreatorInfo>(q);

	return data;
};

export const useReplies = ({
	collectionName,
	postId,
	commentId,
}: {
	collectionName: Collection;
	postId: string;
	commentId: string;
}) => {
	return useQuery({
		queryKey: ['replies', collectionName, postId, commentId],
		queryFn: () => fetchReplies(collectionName, postId, commentId),
		enabled: !!collectionName && !!postId && !!commentId,
		staleTime: 1000 * 60 * 5, // 5분간 fresh
	});
};

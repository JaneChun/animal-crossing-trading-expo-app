import CommentUnitSkeleton from './CommentUnitSkeleton';

const SKELETON_COUNT = 3;

const CommentListSkeleton = () => (
	<>
		{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
			<CommentUnitSkeleton key={i} />
		))}
	</>
);

export default CommentListSkeleton;

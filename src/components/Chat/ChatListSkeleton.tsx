import ChatUnitSkeleton from './ChatUnitSkeleton';

const SKELETON_COUNT = 6;

const ChatListSkeleton = () => (
	<>
		{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
			<ChatUnitSkeleton key={i} />
		))}
	</>
);

export default ChatListSkeleton;

import {
	navigate,
	navigateToTabAndResetStack,
	navigateWithoutParams,
	popTo,
	replace,
} from '@/navigation/RootNavigation';
import { CreateChatRoomParams, SendChatMessageParams } from '@/types/chat';
import { Collection } from '@/types/post';

// Search/
export const navigateToSearch = () => {
	navigateWithoutParams('Search');
};

// NewPost/
export const navigateToPost = ({
	postId,
	collectionName,
}: {
	postId: string;
	collectionName: Collection;
}) => {
	navigate('PostDetail', {
		id: postId,
		collectionName,
	});
};

export const navigateToNewPost = () => {
	navigate('NewPost', {
		id: undefined,
	});
};

export const navigateToEditPost = ({ postId }: { postId: string }) => {
	navigate('NewPost', {
		id: postId,
	});
};

// PostDetail/
export const navigateToPostDetail = ({
	postId,
	collectionName,
	notificationId,
}: {
	postId: string;
	collectionName: Collection;
	notificationId?: string;
}) => {
	navigate('PostDetail', {
		id: postId,
		collectionName,
		...(notificationId && { notificationId }),
	});
};

export const popToPostDetail = ({
	postId,
	collectionName,
}: {
	postId: string;
	collectionName: Collection;
}) => {
	popTo('PostDetail', {
		id: postId,
		collectionName,
	});
};

// Comment
export const navigateToEditComment = ({
	postId,
	commentId,
	body,
}: {
	postId: string;
	commentId: string;
	body: string;
}) => {
	navigate('EditComment', { postId, commentId, body });
};

// Chat/
export const navigateToChatRoom = ({
	chatId,
	chatStartInfo,
	systemMessage,
}: {
	chatId: string;
	chatStartInfo?: CreateChatRoomParams;
	systemMessage?: SendChatMessageParams;
}) => {
	navigate('ChatRoom', { chatId, chatStartInfo, systemMessage });
};

// Profile/
// stack to stack
export const navigateToUserProfile = ({ userId }: { userId: string }) => {
	navigate('Profile', { userId });
};

export const replaceToMyProfile = () => {
	replace('Profile', {});
};

// stack to tab
export const navigateToLogin = () => {
	navigateToTabAndResetStack('ProfileTab', 'Login');
};

// tab to tab
export const navigateToMyProfile = () => {
	navigateToTabAndResetStack('ProfileTab', 'Profile');
};

export const navigateToSetting = () => {
	navigateWithoutParams('Setting');
};

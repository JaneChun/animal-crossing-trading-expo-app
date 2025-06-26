import {
	navigate,
	navigateToTabAndResetStack,
	navigateWithoutParams,
	popTo,
	replace,
} from '@/navigation/RootNavigation';
import { CreateChatRoomParams, SendChatMessageParams } from '@/types/chat';
import { Collection } from '@/types/post';
import { OauthType } from '@/types/user';

// Search/
export const navigateToSearch = () => {
	navigateWithoutParams('Search');
};

// NewPost/
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
export const navigateToPost = ({
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

export const navigateToSignUp = ({
	uid,
	oauthType,
	email,
}: {
	uid: string;
	oauthType: OauthType;
	email: string;
}) => {
	navigate('SignUpDisplayName', { uid, oauthType, email });
};

export const navigateToSignUpEnd = ({
	uid,
	oauthType,
	email,
	displayName,
}: {
	uid: string;
	oauthType: OauthType;
	email: string;
	displayName: string;
}) => {
	navigate('SignUpIslandName', { uid, oauthType, email, displayName });
};

export const navigateToAccount = () => {
	navigateWithoutParams('Account');
};

export const navigateToSocialAccountCheck = () => {
	navigateWithoutParams('SocialAccountCheck');
};

export const navigateToDeleteAccount = () => {
	navigateWithoutParams('DeleteAccount');
};

export const navigateToBlock = () => {
	navigateWithoutParams('Block');
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

import {
	navigate,
	navigateToTabAndResetStack,
	navigateWithoutParams,
	popTo,
	replace,
} from '@/navigation/RootNavigation';
import { CreateChatRoomParams, SendChatMessageParams } from '@/types/chat';
import { Collection } from '@/types/post';
import { SignUpParams } from '@/types/user';

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

export const navigateToAgreeToTermsAndConditions = ({
	uid,
	oauthType,
	email,
}: SignUpParams) => {
	navigate('AgreeToTermsAndConditions', { uid, oauthType, email });
};

export const navigateToSignUp = ({ uid, oauthType, email }: SignUpParams) => {
	navigate('SignUpDisplayName', { uid, oauthType, email });
};

export const navigateToSignUpEnd = ({
	uid,
	oauthType,
	email,
	displayName,
}: SignUpParams & {
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

export const navigateToTermsOfService = () => {
	navigateWithoutParams('TermsOfService');
};

export const navigateToPrivacyPolicy = () => {
	navigateWithoutParams('PrivacyPolicy');
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

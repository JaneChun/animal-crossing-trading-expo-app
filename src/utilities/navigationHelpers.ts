import { navigate, navigateToTabAndResetStack, popTo, replace } from '@/navigation/RootNavigation';
import { AdminUserRecordKind } from '@/types/admin';
import { CreateChatRoomParams, SendChatMessageParams } from '@/types/chat';
import { Collection } from '@/types/post';
import { SignUpParams } from '@/types/user';

// MainTab
export const replaceToHome = () => {
	replace('MainTab', { screen: 'HomeTab' });
};

// Search/
export const navigateToSearch = () => {
	navigate('Search');
};

// NewPost/
export const navigateToNewPost = (collectionName: Collection) => {
	navigate('NewPost', {
		id: undefined,
		collectionName,
	});
};

export const navigateToEditPost = ({
	postId,
	collectionName,
}: {
	postId: string;
	collectionName: Collection;
}) => {
	navigate('NewPost', {
		id: postId,
		collectionName,
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
	receiverInfo,
}: {
	chatId: string;
	chatStartInfo?: CreateChatRoomParams;
	systemMessage?: SendChatMessageParams;
	receiverInfo?: {
		uid: string;
		displayName: string;
		islandName: string;
		photoURL?: string;
	};
}) => {
	navigate('ChatRoom', { chatId, chatStartInfo, systemMessage, receiverInfo });
};

// Profile/
// stack to stack
export const navigateToUserProfile = ({ userId }: { userId: string }) => {
	navigate('Profile', { userId });
};

export const replaceToMyProfile = () => {
	replace('Profile', {});
};

export const navigateToAgreeToTermsAndConditions = ({ uid, oauthType, email }: SignUpParams) => {
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
	navigate('Account');
};

export const navigateToSocialAccountCheck = () => {
	navigate('SocialAccountCheck');
};

export const navigateToDeleteAccount = () => {
	navigate('DeleteAccount');
};

export const navigateToBlock = () => {
	navigate('Block');
};

export const navigateToTermsOfService = () => {
	navigate('TermsOfService');
};

export const navigateToPrivacyPolicy = () => {
	navigate('PrivacyPolicy');
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
	navigate('Setting');
};

// Admin/
export const navigateToAdminHome = () => {
	navigate('AdminHome');
};

export const navigateToAdminReports = () => {
	navigate('AdminReports');
};

export const navigateToAdminReviewUsers = () => {
	navigate('AdminReviewUsers');
};

export const navigateToAdminReportDetail = ({ reportId }: { reportId: string }) => {
	navigate('AdminReportDetail', { reportId });
};

export const navigateToAdminChatViewer = ({
	chatId,
	reporterId,
	reporteeId,
}: {
	chatId: string;
	reporterId: string;
	reporteeId: string;
}) => {
	navigate('AdminChatViewer', { chatId, reporterId, reporteeId });
};

export const navigateToAdminStats = () => {
	navigate('AdminStats');
};

export const navigateToAdminUsers = () => {
	navigate('AdminUsers');
};

export const navigateToAdminUserDetail = ({ uid }: { uid: string }) => {
	navigate('AdminUserDetail', { uid });
};

export const navigateToAdminUserRecords = ({
	uid,
	kind,
}: {
	uid: string;
	kind: AdminUserRecordKind;
}) => {
	navigate('AdminUserRecords', { uid, kind });
};

export const navigateToAdminErrors = () => {
	navigate('AdminErrors');
};

export const navigateToDesignSystem = () => {
	navigate('DesignSystem');
};

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AdminUserRecordKind } from './admin';
import { CreateChatRoomParams, SendChatMessageParams } from './chat';
import { Collection } from './post';
import { SignUpParams } from './user';

// RootStack 네비게이션
export type RootStackParamList = {
	Onboarding: undefined;
	MainTab: NavigatorScreenParams<MainTabParamList>;
	PostDetail: {
		id: string;
		collectionName: Collection;
		notificationId?: string; // 알림탭에서 이동 시 알림 처리 위해 전달
	};
	NewPost: { id?: string; collectionName?: Collection }; // 글 수정 시 id, collectionName 전달
	ChatRoom: {
		chatId: string;
		chatStartInfo?: CreateChatRoomParams;
		systemMessage?: SendChatMessageParams;
		receiverInfo?: {
			uid: string;
			displayName: string;
			islandName: string;
			photoURL?: string;
		};
	};
	Profile: { userId?: string }; // 다른 유저 프로필 조회 시 userId 전달
	AgreeToTermsAndConditions: SignUpParams;
	SignUpDisplayName: SignUpParams;
	SignUpIslandName: SignUpParams & { displayName: string };
	Setting: undefined;
	Account: undefined;
	SocialAccountCheck: undefined;
	DeleteAccount: undefined;
	Block: undefined;
	TermsOfService: undefined;
	PrivacyPolicy: undefined;
	OperationPolicy: undefined;
	SanctionWarning: { sanctionId: string };
	Suspended: undefined;
	AppealForm: { sanctionId: string };
	Inquiries: undefined;
	InquiryDetail: { sanctionId: string };
	Search: undefined;
	AdminHome: undefined;
	AdminReports: undefined;
	AdminReportDetail: { reportId: string };
	AdminChatViewer: { chatId: string; reporterId: string; reporteeId: string };
	AdminStats: undefined;
	AdminUsers: undefined;
	AdminUserDetail: { uid: string };
	AdminUserRecords: { uid: string; kind: AdminUserRecordKind };
	AdminErrors: undefined;
	AdminSanctionDetail: { sanctionId: string };
	AdminSuspend: { uid: string; reportId?: string; isWarning?: boolean }; // reportId: 근거 신고로 미리 선택할 신고, isWarning: 정지 대신 경고
	DesignSystem: undefined;
};

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;

// MainTab 네비게이션
export type MainTabParamList = {
	HomeTab: undefined;
	CommunityTab: undefined;
	NoticeTab: undefined;
	ChatTab: undefined;
	ProfileTab: undefined;
};

export type TabNavigation = BottomTabNavigationProp<MainTabParamList>;

// Route Props (for useRoute)
export type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;
export type NewPostRouteProp = RouteProp<RootStackParamList, 'NewPost'>;
export type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;
export type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
export type SignUpDisplayNameRouteProp = RouteProp<RootStackParamList, 'SignUpDisplayName'>;
export type SignUpIslandNameRouteProp = RouteProp<RootStackParamList, 'SignUpIslandName'>;
export type AdminReportDetailRouteProp = RouteProp<RootStackParamList, 'AdminReportDetail'>;
export type AdminChatViewerRouteProp = RouteProp<RootStackParamList, 'AdminChatViewer'>;
export type AdminUserDetailRouteProp = RouteProp<RootStackParamList, 'AdminUserDetail'>;
export type AdminSanctionDetailRouteProp = RouteProp<RootStackParamList, 'AdminSanctionDetail'>;
export type AdminSuspendRouteProp = RouteProp<RootStackParamList, 'AdminSuspend'>;
export type SanctionWarningRouteProp = RouteProp<RootStackParamList, 'SanctionWarning'>;
export type AppealFormRouteProp = RouteProp<RootStackParamList, 'AppealForm'>;
export type InquiryDetailRouteProp = RouteProp<RootStackParamList, 'InquiryDetail'>;
export type AdminUserRecordsRouteProp = RouteProp<RootStackParamList, 'AdminUserRecords'>;

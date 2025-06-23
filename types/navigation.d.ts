import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreateChatRoomParams, SendChatMessageParams } from './chat';
import { Collection } from './post';
import { OauthType } from './user';

// RootStack 네비게이션
export type RootStackParamList = {
	MainTab: NavigatorScreenParams<MainTabParamList>;
	PostDetail: {
		id: string;
		collectionName: Collection;
		notificationId?: string; // 알림탭에서 이동 시 알림 처리 위해 전달
	};
	NewPost: { id?: string }; // 글 수정 시 id 전달
	ChatRoom: {
		chatId: string;
		chatStartInfo?: CreateChatRoomParams;
		systemMessage?: SendChatMessageParams;
	};
	Profile: { userId?: string }; // 다른 유저 프로필 조회 시 userId 전달
	SignUpDisplayName: { uid: string; oauthType: OauthType; email: string };
	SignUpIslandName: {
		uid: string;
		oauthType: OauthType;
		email: string;
		displayName: string;
	};
	Setting: undefined;
	Account: undefined;
	SocialAccountCheck: undefined;
	DeleteAccount: undefined;
	Search: undefined;
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
export type SignUpDisplayNameRouteProp = RouteProp<
	RootStackParamList,
	'SignUpDisplayName'
>;
export type SignUpIslandNameRouteProp = RouteProp<
	RootStackParamList,
	'SignUpIslandName'
>;

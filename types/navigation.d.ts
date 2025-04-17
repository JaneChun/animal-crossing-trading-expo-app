import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CartItem } from './post';

// 하단 탭 네비게이션
export type RootTabParamList = {
	HomeTab: NavigatorScreenParams<HomeStackParamList>;
	CommunityTab: NavigatorScreenParams<CommunityStackParamList>;
	NoticeTab: NavigatorScreenParams<NoticeStackParamList>;
	ChatTab: NavigatorScreenParams<ChatStackParamList>;
	ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Home 스택 네비게이션
export type HomeStackParamList = {
	Home: undefined;
	PostDetail: { id: string };
	NewPost: { id?: string; updatedCart?: CartItem[] };
	EditComment: { postId: string; commentId: string; body: string };
	Profile: { userId: string };
};

// Community 스택 네비게이션
export type CommunityStackParamList = {
	Community: undefined;
	PostDetail: { id: string };
	NewPost: { id?: string; updatedCart?: CartItem[] };
	EditComment: { postId: string; commentId: string; body: string };
	Profile: { userId: string };
};

// Notice 스택 네비게이션
export type NoticeStackParamList = {
	Notice: undefined;
	PostDetail: { id: string; collection: Collection };
};

// Chat 스택 네비게이션
export type ChatStackParamList = {
	Chat: undefined;
	ChatRoom: { chatId: string };
	PostDetail: { id: string; collection: Collection };
};

// Profile 스택 네비게이션
export type ProfileStackParamList = {
	Login: undefined;
	Profile: undefined;
	PostDetail: { id: string };
	NewPost: { id?: string; updatedCart?: CartItem[] };
	Setting: undefined;
};

// 전체 앱에서 사용할 네비게이션 타입
export type TabNavigation = BottomTabNavigationProp<RootTabParamList>;
export type HomeStackNavigation = NativeStackNavigationProp<HomeStackParamList>;
export type CommunityStackNavigation =
	NativeStackNavigationProp<CommunityStackParamList>;
export type NoticeStackNavigation =
	NativeStackNavigationProp<NoticeStackParamList>;
export type ChatStackNavigation = NativeStackNavigationProp<ChatStackParamList>;
export type ProfileStackNavigation =
	NativeStackNavigationProp<ProfileStackParamList>;

// 특정 화면에 대한 Route Prop (화면에서 `route.params`를 사용할 때 필요함)
export type PostDetailRouteProp = RouteProp<HomeStackParamList, 'PostDetail'>;
export type EditCommentRouteProp = RouteProp<HomeStackParamList, 'EditComment'>;
export type NewPostRouteProp = RouteProp<HomeStackParamList, 'NewPost'>;
export type ProfileRouteProp = RouteProp<HomeStackParamList, 'Profile'>;
export type ChatRoomRouteProp = RouteProp<ChatStackParamList, 'ChatRoom'>;

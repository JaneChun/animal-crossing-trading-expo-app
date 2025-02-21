import { UserInfo } from '@/contexts/AuthContext';
import { ReceiverInfo } from '@/hooks/useGetChats';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 하단 탭 네비게이션
export type RootTabParamList = {
	HomeTab: NavigatorScreenParams<HomeStackParamList>;
	ChatTab: NavigatorScreenParams<Chat>;
	NewPostTab: { id: string };
	SearchTab: undefined;
	ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Home 스택 네비게이션
export type HomeStackParamList = {
	Home: undefined;
	PostDetail: { id: string };
	NewPost: { id?: string };
	EditComment: { postId: string; commentId: string; comment: string };
};

// Chat 스택 네비게이션
export type ChatStackParamList = {
	Chat: undefined;
	ChatRoom: { chatId: string; receiverInfo: ReceiverInfo };
};

// Profile 스택 네비게이션
export type ProfileStackParamList = {
	Login: undefined;
	Profile: undefined;
	EditProfile: { userInfo: UserInfo };
	Setting: undefined;
};

// 전체 앱에서 사용할 네비게이션 타입
export type TabNavigation = BottomTabNavigationProp<RootTabParamList>;
export type HomeStackNavigation = NativeStackNavigationProp<HomeStackParamList>;
export type ChatStackNavigation = NativeStackNavigationProp<ChatStackParamList>;
export type ProfileStackNavigation =
	NativeStackNavigationProp<ProfileStackParamList>;

// 특정 화면에 대한 Route Prop (화면에서 `route.params`를 사용할 때 필요함)
export type PostDetailRouteProp = RouteProp<HomeStackParamList, 'PostDetail'>;
export type EditCommentRouteProp = RouteProp<HomeStackParamList, 'EditComment'>;
export type NewPostRouteProp = RouteProp<RootTabParamList, 'NewPost'>;
export type ChatRoomRouteProp = RouteProp<ChatStackParamList, 'ChatRoom'>;
export type EditProfileRouteProp = RouteProp<
	ProfileStackParamList,
	'EditProfile'
>;

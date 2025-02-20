import { UserInfo } from '@/contexts/AuthContext';
import { ReceiverInfo } from '@/hooks/useGetChats';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootTabParamList = {
	Home: NavigatorScreenParams<HomeStackParamList>;
	MyChat: NavigatorScreenParams<MyChat>;
	NewPost: { id: string };
	Search: undefined;
	Login: undefined;
	MyPage: undefined;
	// 모달로 표시되는 화면
	EditProfile: { userInfo: UserInfo };
	EditComment: { postId: string; commentId: string; comment: string };
};

// HomeStack 탭 내부에서 관리하는 Stack Navigator
export type HomeStackParamList = {
	Post: undefined;
	PostDetail: { id: string };
};

// MyChatStack
export type MyChatStackParamList = {
	Chat: undefined;
	ChatRoom: { chatId: string; receiverInfo: ReceiverInfo };
};

// 전체 앱에서 사용할 네비게이션 타입
export type TabNavigation = BottomTabNavigationProp<RootTabParamList>;
export type HomeStackNavigation = NativeStackNavigationProp<HomeStackParamList>;
export type MyChatStackNavigation =
	NativeStackNavigationProp<MyChatStackParamList>;

// 특정 화면에 대한 Route Prop (화면에서 `route.params`를 사용할 때 필요함)
export type PostDetailRouteProp = RouteProp<HomeStackParamList, 'PostDetail'>;
export type NewPostRouteProp = RouteProp<RootTabParamList, 'NewPost'>;
export type EditProfileRouteProp = RouteProp<RootTabParamList, 'EditProfile'>;
export type EditCommentRouteProp = RouteProp<RootTabParamList, 'EditComment'>;
export type ChatRoomRouteProp = RouteProp<MyChatStackParamList, 'ChatRoom'>;

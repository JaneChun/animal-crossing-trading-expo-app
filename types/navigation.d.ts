import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CartItem, Collection } from './post';

// RootStack 네비게이션
export type RootStackParamList = {
	MainTab: NavigatorScreenParams<MainTabParamList>;
	PostDetail: { id: string; collectionName: Collection };
	NewPost: { id?: string; updatedCart?: CartItem[] }; // 글 수정 시 id 전달, 마켓글은 updatedCart 사용
	EditComment: { postId: string; commentId: string; body: string };
	ChatRoom: { chatId: string };
	Profile: { userId?: string }; // 다른 유저 프로필 조회 시 userId 전달
	Setting: undefined;
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
export type EditCommentRouteProp = RouteProp<RootStackParamList, 'EditComment'>;
export type NewPostRouteProp = RouteProp<RootStackParamList, 'NewPost'>;
export type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;
export type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

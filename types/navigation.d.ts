import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { UserInfo } from '@/contexts/AuthContext';

export type RootTabParamList = {
	Home: NavigatorScreenParams<HomeStackParamList>;
	MyChat: undefined;
	NewPost: { id: string };
	Search: undefined;
	Login: undefined;
	MyPage: undefined;
};

// HomeStack 탭 내부에서 관리하는 Stack Navigator
export type HomeStackParamList = {
	Post: undefined;
	PostDetail: { id: string };
};

// MyPageStack 탭 내부에서 관리하는 Stack Navigator
export type ProfileStackParamList = {
	MyPage: undefined;
	EditProfile: { userInfo: UserInfo };
};

export type TabNavigation = BottomTabNavigationProp<RootTabParamList>;
export type StackNavigation = NativeStackNavigationProp<HomeStackParamList>;
export type ProfileStackNavigation =
	NativeStackNavigationProp<ProfileStackParamList>;

export type PostDetailRouteProp = RouteProp<HomeStackParamList, 'PostDetail'>;
export type NewPostRouteProp = RouteProp<RootTabParamList, 'NewPost'>;
export type EditProfileRouteProp = RouteProp<
	ProfileStackParamList,
	'EditProfile'
>;

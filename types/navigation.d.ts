import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
	Home: undefined;
	MyChat: undefined;
	NewPost: undefined;
	Search: undefined;
	Login: undefined;
	MyPage: undefined;
};

export type TabNavigation = BottomTabNavigationProp<RootTabParamList>;

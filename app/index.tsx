import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
	Entypo,
	FontAwesome,
	FontAwesome6,
	MaterialCommunityIcons,
	MaterialIcons,
} from '@expo/vector-icons';

import Home from '@/screens/Home';
import PostDetail from '@/screens/PostDetail';
import MyChat from '@/screens/MyChat';
import NewPost from '@/screens/NewPost';
import Search from '@/screens/Search';
import Login from '@/screens/Login';
import MyPage from '@/screens/MyPage';

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();

const HomeStack = () => {
	return (
		<Stack.Navigator screenOptions={{ title: '🏝️ 모동숲 마켓' }}>
			<Stack.Screen name='Home' component={Home} />
			<Stack.Screen name='PostDetail' component={PostDetail} />
		</Stack.Navigator>
	);
};

export default function Index() {
	return (
		<>
			<BottomTab.Navigator
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						height: 60,
						paddingHorizontal: 8,
						paddingTop: 8,
					},
					tabBarShowLabel: false,
				}}
			>
				<BottomTab.Screen
					name='Home'
					component={HomeStack}
					options={{
						tabBarIcon: ({ focused }) => <Entypo name='home' size={24} />,
					}}
				/>
				<BottomTab.Screen
					name='MyChat'
					component={MyChat}
					options={{
						tabBarIcon: ({ focused }) => (
							<MaterialCommunityIcons name='chat' size={24} />
						),
					}}
				/>
				<BottomTab.Screen
					name='NewPost'
					component={NewPost}
					options={{
						tabBarIcon: ({ focused }) => (
							<FontAwesome6 name='circle-plus' size={20} />
						),
					}}
				/>
				<BottomTab.Screen
					name='Search'
					component={Search}
					options={{
						tabBarIcon: ({ focused }) => (
							<FontAwesome name='search' size={22} />
						),
					}}
				/>
				<BottomTab.Screen
					name='Login'
					component={Login}
					options={{
						tabBarIcon: ({ focused }) => <Entypo name='login' size={24} />,
					}}
				/>
				{/* <BottomTab.Screen 
					name='MyPage'
					component={MyPage}
					options={{
						tabBarIcon: ({ focused }) => (
							<FontAwesome6 name='user-large' size={21} />
						),
					}}
				/>*/}
			</BottomTab.Navigator>
		</>
	);
}

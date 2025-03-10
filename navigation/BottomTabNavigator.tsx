import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import {
	Entypo,
	FontAwesome6,
	MaterialCommunityIcons,
} from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatStackNavigator from './ChatStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const BottomTab = createBottomTabNavigator();

const getTabBarIcon =
	(name: string, IconComponent: any, size = 24) =>
	({ focused }: { focused: boolean }) =>
		(
			<IconComponent
				name={name}
				size={size}
				color={focused ? Colors.primary : Colors.dark_gray}
			/>
		);

const BottomTabNavigator = () => {
	const { userInfo } = useAuthContext();

	return (
		<BottomTab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					height: 60,
					paddingBottom: 0,
				},
				tabBarShowLabel: false,
				tabBarActiveBackgroundColor: Colors.base,
				tabBarIconStyle: { flex: 1 },
			}}
		>
			<BottomTab.Screen
				name='HomeTab'
				component={HomeStackNavigator}
				options={{
					tabBarIcon: getTabBarIcon('home', Entypo),
				}}
			/>
			<BottomTab.Screen
				name='ChatTab'
				component={ChatStackNavigator}
				options={{
					tabBarIcon: getTabBarIcon('chat', MaterialCommunityIcons),
				}}
			/>
			{/* <BottomTab.Screen
				name='SearchTab'
				component={Search}
				options={{
					tabBarIcon: ({ focused }) => (
						<FontAwesome
							name='search'
							size={22}
							color={focused ? Colors.primary : Colors.dark_gray}
						/>
					),
				}}
			/> */}
			<BottomTab.Screen
				name='ProfileTab'
				component={ProfileStackNavigator}
				options={{
					tabBarIcon: getTabBarIcon(
						userInfo ? 'user-large' : 'login',
						userInfo ? FontAwesome6 : Entypo,
					),
				}}
			/>
		</BottomTab.Navigator>
	);
};

export default BottomTabNavigator;

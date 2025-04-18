import { Colors } from '@/constants/Color';
import Login from '@/screens/Login';
import Profile from '@/screens/Profile';
import { useAuthStore } from '@/stores/AuthStore';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
	const userInfo = useAuthStore((state) => state.userInfo);

	return (
		<ProfileStack.Navigator
			initialRouteName={userInfo ? 'Profile' : 'Login'}
			screenOptions={{
				headerShown: false,
				headerTintColor: Colors.font_black,
				headerBackButtonDisplayMode: 'minimal',
			}}
		>
			<ProfileStack.Screen name='Login' component={Login} />
			{userInfo && (
				<ProfileStack.Screen
					name='Profile'
					component={Profile}
					options={{ title: '프로필' }}
				/>
			)}
		</ProfileStack.Navigator>
	);
};

export default ProfileStackNavigator;

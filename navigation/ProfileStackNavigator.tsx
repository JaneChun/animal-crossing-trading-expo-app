import AuthGuard from '@/components/ui/AuthGuard';
import { Colors } from '@/constants/Color';
import Login from '@/screens/Login';
import Profile from '@/screens/Profile';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
	return (
		<ProfileStack.Navigator
			screenOptions={{
				headerShown: false,
				headerTintColor: Colors.font_black,
				headerBackButtonDisplayMode: 'minimal',
			}}
		>
			<ProfileStack.Screen
				name='Profile'
				children={() => (
					<AuthGuard>
						<Profile />
					</AuthGuard>
				)}
				options={{ title: '프로필' }}
			/>
			<ProfileStack.Screen name='Login' component={Login} />
		</ProfileStack.Navigator>
	);
};

export default ProfileStackNavigator;

import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { Colors } from '@/constants/Color';
import Login from '@/screens/Login';
import Profile from '@/screens/Profile';
import { useAuthStore, useUserInfo } from '@/stores/auth';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
	const userInfo = useUserInfo();
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

	if (isAuthLoading) {
		return <LoadingIndicator />;
	}

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
				component={userInfo ? Profile : Login}
				options={{ title: '프로필' }}
			/>
		</ProfileStack.Navigator>
	);
};

export default ProfileStackNavigator;

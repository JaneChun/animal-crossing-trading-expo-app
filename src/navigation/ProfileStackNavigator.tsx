import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Login from '@/screens/Login';
import Profile from '@/screens/Profile';
import { useAuthStore, useUserInfo } from '@/stores/auth';
import { useTheme } from '@/theme';

const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
	const userInfo = useUserInfo();
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
	const { colors } = useTheme();

	if (isAuthLoading) {
		return <LoadingIndicator />;
	}

	return (
		<ProfileStack.Navigator
			screenOptions={{
				headerShown: false,
				headerTintColor: colors.text.primary,
				headerBackButtonDisplayMode: 'minimal',
			}}
		>
			<ProfileStack.Screen
				name="Profile"
				component={userInfo ? Profile : Login}
				options={{ title: '프로필' }}
			/>
		</ProfileStack.Navigator>
	);
};

export default ProfileStackNavigator;

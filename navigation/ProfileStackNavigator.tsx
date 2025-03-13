import { useAuthContext } from '@/contexts/AuthContext';
import Login from '@/screens/Login';
import NewPost from '@/screens/NewPost';
import PostDetail from '@/screens/PostDetail';
import Profile from '@/screens/Profile';
import Setting from '@/screens/Setting';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
	const { userInfo } = useAuthContext();

	return (
		<ProfileStack.Navigator screenOptions={{ headerShown: false }}>
			{userInfo ? (
				<>
					<ProfileStack.Screen
						name='Profile'
						component={Profile}
						options={{ title: '프로필' }}
					/>
					<ProfileStack.Screen
						name='PostDetail'
						component={PostDetail}
						options={{ title: '', headerShown: true }}
					/>
					<ProfileStack.Screen
						name='NewPost'
						component={NewPost}
						options={{ title: '거래글', headerShown: true }}
					/>
					<ProfileStack.Screen
						name='Setting'
						component={Setting}
						options={{
							headerShown: true,
							title: '설정',
						}}
					/>
				</>
			) : (
				<ProfileStack.Screen name='Login' component={Login} />
			)}
		</ProfileStack.Navigator>
	);
};

export default ProfileStackNavigator;

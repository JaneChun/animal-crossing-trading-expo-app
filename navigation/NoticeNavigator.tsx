import { Colors } from '@/constants/Color';
import Notice from '@/screens/Notice';
import PostDetail from '@/screens/PostDetail';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const NoticeStack = createNativeStackNavigator();

const NoticeStackNavigator = () => {
	return (
		<NoticeStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<NoticeStack.Screen name='Notice' component={Notice} />
			<NoticeStack.Screen
				name='PostDetail'
				component={PostDetail}
				options={{
					headerShown: true,
					title: '',
					headerTintColor: Colors.font_black,
					headerBackButtonDisplayMode: 'minimal',
				}}
			/>
		</NoticeStack.Navigator>
	);
};

export default NoticeStackNavigator;

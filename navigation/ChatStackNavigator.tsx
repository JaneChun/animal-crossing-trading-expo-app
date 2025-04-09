import { Colors } from '@/constants/Color';
import Chat from '@/screens/Chat';
import ChatRoom from '@/screens/ChatRoom';
import PostDetail from '@/screens/PostDetail';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ChatStack = createNativeStackNavigator();

const ChatStackNavigator = () => {
	return (
		<ChatStack.Navigator
			screenOptions={{
				headerShown: false,
				gestureDirection: 'horizontal',
				animation: 'slide_from_left',
			}}
		>
			<ChatStack.Screen name='Chat' component={Chat} />
			<ChatStack.Screen name='ChatRoom' component={ChatRoom} />
			<ChatStack.Screen
				name='PostDetail'
				component={PostDetail}
				options={{
					headerShown: true,
					title: '',
					headerTintColor: Colors.font_black,
					headerBackButtonDisplayMode: 'minimal',
				}}
			/>
		</ChatStack.Navigator>
	);
};

export default ChatStackNavigator;

import Chat from '@/screens/Chat';
import ChatRoom from '@/screens/ChatRoom';
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
		</ChatStack.Navigator>
	);
};

export default ChatStackNavigator;

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Notice from '@/screens/Notice';

const NoticeStack = createNativeStackNavigator();

const NoticeStackNavigator = () => {
	return (
		<NoticeStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<NoticeStack.Screen name="Notice" component={Notice} />
		</NoticeStack.Navigator>
	);
};

export default NoticeStackNavigator;

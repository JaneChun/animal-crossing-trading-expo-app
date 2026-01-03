import Home from '@/screens/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
	return (
		<HomeStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<HomeStack.Screen name='Home' component={Home} />
		</HomeStack.Navigator>
	);
};

export default HomeStackNavigator;

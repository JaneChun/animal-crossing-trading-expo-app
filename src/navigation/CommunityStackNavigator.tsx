import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Community from '@/screens/Community';

const CommunityStack = createNativeStackNavigator();

const CommunityStackNavigator = () => {
	return (
		<CommunityStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<CommunityStack.Screen name="Community" component={Community} />
		</CommunityStack.Navigator>
	);
};

export default CommunityStackNavigator;

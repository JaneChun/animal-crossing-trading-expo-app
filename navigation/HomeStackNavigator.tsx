import EditComment from '@/screens/EditComment';
import Home from '@/screens/Home';
import NewPost from '@/screens/NewPost';
import PostDetail from '@/screens/PostDetail';
import { FontAwesome } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
	return (
		<HomeStack.Navigator
			screenOptions={{
				title: '모동숲 마켓',
				headerRight: () => (
					<FontAwesome name='leaf' color={Colors.primary} size={24} />
				),
			}}
		>
			<HomeStack.Screen name='Home' component={Home} />
			<HomeStack.Screen name='PostDetail' component={PostDetail} />
			<HomeStack.Screen
				name='NewPost'
				component={NewPost}
				options={{ title: '글 작성/수정' }}
			/>
			<HomeStack.Screen
				name='EditComment'
				component={EditComment}
				options={{
					presentation: 'modal',
					title: '댓글 수정',
				}}
			/>
		</HomeStack.Navigator>
	);
};

export default HomeStackNavigator;

import EditComment from '@/screens/EditComment';
import Home from '@/screens/Home';
import NewPost from '@/screens/NewPost';
import PostDetail from '@/screens/PostDetail';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
	return (
		<HomeStack.Navigator
			screenOptions={{
				title: '모동숲 마켓',
			}}
		>
			<HomeStack.Screen name='Home' component={Home} />
			<HomeStack.Screen name='PostDetail' component={PostDetail} />
			<HomeStack.Screen
				name='NewPost'
				component={NewPost}
				options={{ title: '거래글' }}
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

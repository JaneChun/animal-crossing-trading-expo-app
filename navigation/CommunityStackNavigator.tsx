import Community from '@/screens/Community';
import EditComment from '@/screens/EditComment';
import NewPost from '@/screens/NewPost';
import PostDetail from '@/screens/PostDetail';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const CommunityStack = createNativeStackNavigator();

const CommunityStackNavigator = () => {
	return (
		<CommunityStack.Navigator screenOptions={{ headerShown: false }}>
			<CommunityStack.Screen
				name='Community'
				component={Community}
				options={{ title: '커뮤니티' }}
			/>
			<CommunityStack.Screen
				name='PostDetail'
				component={PostDetail}
				options={{ headerShown: true, title: '' }}
			/>
			<CommunityStack.Screen
				name='NewPost'
				component={NewPost}
				options={{ title: '게시글', headerShown: true }}
			/>
			<CommunityStack.Screen
				name='EditComment'
				component={EditComment}
				options={{
					presentation: 'modal',
					title: '댓글 수정',
				}}
			/>
		</CommunityStack.Navigator>
	);
};

export default CommunityStackNavigator;

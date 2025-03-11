import PostList from '@/components/Home/PostList';
import Layout from '@/components/ui/Layout';

const Community = () => {
	return (
		<Layout title='게시글'>
			<PostList tab='community' />
		</Layout>
	);
};

export default Community;

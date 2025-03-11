import PostList from '@/components/Home/PostList';
import Layout from '@/components/ui/Layout';

const Home = () => {
	return (
		<Layout title='거래글'>
			<PostList tab='market' />
		</Layout>
	);
};

export default Home;

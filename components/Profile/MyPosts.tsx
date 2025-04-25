import { PublicUserInfo } from '@/types/user';
import React from 'react';
import PostList from '../Home/PostList';
import Layout, { PADDING } from '../ui/layout/Layout';

const MyPosts = ({ profileInfo }: { profileInfo: PublicUserInfo }) => {
	return (
		<Layout
			title='작성한 글'
			containerStyle={{ paddingTop: PADDING }}
			headerStyle={{ paddingBottom: 0 }}
		>
			<PostList
				collectionName='Boards'
				filter={{ creatorId: profileInfo?.uid }}
				containerStyle={{ paddingHorizontal: PADDING }}
			/>
		</Layout>
	);
};

export default MyPosts;

import { MyPostsProps } from '@/types/components';
import React from 'react';
import PostList from '../Home/PostList';
import Layout, { PADDING } from '../ui/layout/Layout';

const MyPosts = ({ isMyProfile, profileInfo }: MyPostsProps) => {
	return (
		<Layout
			title={
				isMyProfile ? '나의 거래글' : `${profileInfo.displayName}님의 거래글`
			}
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

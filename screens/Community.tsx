import PostList from '@/components/Home/PostList';
import Categories from '@/components/ui/Categories';
import Layout from '@/components/ui/Layout';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useNavigationStore } from '@/store/store';
import { Tab } from '@/types/components';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback, useState } from 'react';

const Community = () => {
	const { setActiveTab } = useNavigationStore();
	const currentTab = useCurrentTab();
	const isFocused = useIsFocused();
	const [category, setCategory] = useState<string>('all');

	useFocusEffect(
		useCallback(() => {
			if (isFocused) setActiveTab(currentTab as Tab);
		}, [isFocused]),
	);

	return (
		<Layout title='커뮤니티'>
			<Categories
				categories={categories}
				category={category}
				setCategory={setCategory}
			/>

			<PostList
				collectionName='Communities'
				filter={{ category }}
				isAddPostButtonVisible
			/>
		</Layout>
	);
};

export default Community;

export const categories = [
	{ KR: '전체', EN: 'all' },
	{ KR: '자유', EN: 'general' },
	{ KR: '분양', EN: 'giveaway' },
	{ KR: '입양', EN: 'adopt' },
	{ KR: '공략/팁', EN: 'guide' },
	{ KR: '만지작', EN: 'trade' },
	{ KR: '무 주식', EN: 'turnip' },
	{ KR: '꿈번지', EN: 'dream' },
	{ KR: '마이디자인', EN: 'design' },
];

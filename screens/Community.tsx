import PostList from '@/components/Home/PostList';
import SearchIcon from '@/components/Search/SearchIcon';
import Categories from '@/components/ui/Categories';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import { CATEGORIES } from '@/constants/post';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { Category, CategoryItem, Tab } from '@/types/post';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback, useState } from 'react';

const Community = () => {
	const setActiveTab = useActiveTabStore((state) => state.setActiveTab);
	const currentTab = useCurrentTab();
	const isFocused = useIsFocused();
	const [category, setCategory] = useState<Category>('all');

	useFocusEffect(
		useCallback(() => {
			if (isFocused) setActiveTab(currentTab as Tab);
		}, [isFocused]),
	);

	return (
		<Layout title='커뮤니티' headerRightComponent={<SearchIcon />}>
			<Categories<Category, CategoryItem>
				categories={CATEGORIES}
				category={category}
				setCategory={setCategory}
				containerStyle={{ paddingHorizontal: PADDING, marginBottom: 8 }}
			/>

			<PostList
				collectionName='Communities'
				filter={{ category }}
				isAddPostButtonVisible
				containerStyle={{ paddingHorizontal: PADDING }}
			/>
		</Layout>
	);
};

export default Community;

import PostList from '@/components/Home/PostList';
import SearchIcon from '@/components/Search/SearchIcon';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import { useCurrentTab } from '@/hooks/shared/useCurrentTab';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { Tab } from '@/types/post';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';

const Home = () => {
	const setActiveTab = useActiveTabStore((state) => state.setActiveTab);
	const currentTab = useCurrentTab();

	const isFocused = useIsFocused();

	useFocusEffect(
		useCallback(() => {
			if (isFocused) setActiveTab(currentTab as Tab);
		}, [isFocused]),
	);

	return (
		<Layout title='거래글' headerRightComponent={<SearchIcon />}>
			<PostList
				collectionName='Boards'
				isAddPostButtonVisible
				containerStyle={{ paddingHorizontal: PADDING }}
			/>
		</Layout>
	);
};

export default Home;

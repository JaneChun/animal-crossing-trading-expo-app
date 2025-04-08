import PostList from '@/components/Home/PostList';
import Layout, { PADDING } from '@/components/ui/Layout';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { Tab } from '@/types/components';
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
		<Layout title='거래글'>
			<PostList
				collectionName='Boards'
				isAddPostButtonVisible
				containerStyle={{ paddingHorizontal: PADDING }}
			/>
		</Layout>
	);
};

export default Home;

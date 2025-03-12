import PostList from '@/components/Home/PostList';
import Layout from '@/components/ui/Layout';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useNavigationStore } from '@/store/store';
import { Tab } from '@/types/components';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';

const Community = () => {
	const { setActiveTab } = useNavigationStore();
	const currentTab = useCurrentTab();

	const isFocused = useIsFocused();

	useFocusEffect(
		useCallback(() => {
			if (isFocused) setActiveTab(currentTab as Tab);
		}, [isFocused]),
	);

	return (
		<Layout title='커뮤니티'>
			<PostList tab={currentTab as Tab} />
		</Layout>
	);
};

export default Community;

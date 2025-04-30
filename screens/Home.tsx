import PostList from '@/components/Home/PostList';
import SearchIcon from '@/components/Search/SearchIcon';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { Tab } from '@/types/post';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

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
		<SafeAreaView style={styles.screen}>
			<Layout title='거래글' headerRightComponent={<SearchIcon />}>
				<PostList
					collectionName='Boards'
					isAddPostButtonVisible
					containerStyle={{ paddingHorizontal: PADDING }}
				/>
			</Layout>
		</SafeAreaView>
	);
};

export default Home;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
});

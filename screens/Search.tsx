import SearchResultPostList from '@/components/Search/SearchResultPostList';
import SearchInput from '@/components/ui/inputs/SearchInput';
import { PADDING } from '@/components/ui/layout/Layout';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import { useDebouncedValue } from '@/hooks/shared/useDebouncedValue';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { useState } from 'react';

const Search = () => {
	const { collectionName } = usePostContext();
	const [searchInput, setSearchInput] = useState<string>('');
	const [isSearchResultMode, setIsSearchResultMode] = useState(false);
	const debouncedKeyword = useDebouncedValue(searchInput, 300);

	const onSubmit = () => {
		setIsSearchResultMode(true);
	};

	return (
		<LayoutWithHeader
			headerCenterComponent={
				<SearchInput
					searchInput={searchInput}
					onChangeText={(text: string) => {
						setSearchInput(text);
						if (isSearchResultMode) {
							setIsSearchResultMode(false);
						}
					}}
					resetSearchInput={() => setSearchInput('')}
					onSubmit={onSubmit}
					containerStyle={{ marginLeft: 8, marginRight: 12 }}
					placeholder={`${
						collectionName === 'Boards' ? '거래글' : '게시글'
					} 검색`}
				/>
			}
			hasBorderBottom={false}
		>
			{/* 검색 결과 */}
			{isSearchResultMode ? (
				<SearchResultPostList
					collectionName={collectionName}
					keyword={debouncedKeyword}
					containerStyle={{ paddingHorizontal: PADDING }}
				/>
			) : null}
		</LayoutWithHeader>
	);
};

export default Search;

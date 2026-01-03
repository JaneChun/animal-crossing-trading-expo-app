import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { MyPostsProps } from '@/types/components';
import { Collection } from '@/types/post';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Entypo } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import PostList from '@/components/Home/PostList';
import Layout, { PADDING } from '@/components/ui/layout/Layout';

const OPTIONS = [
	{ value: 'Boards' as Collection, label: '마켓' },
	{ value: 'Communities' as Collection, label: '커뮤니티' },
];

const MyPosts = ({ isMyProfile, profileInfo }: MyPostsProps) => {
	const { showActionSheetWithOptions } = useActionSheet();
	const [selectedCollection, setSelectedCollection] = useState<Collection>('Boards');

	const selectedOption = OPTIONS.find((option) => option.value === selectedCollection);

	const showOptionSelect = () => {
		const actionOptions = [...OPTIONS.map(({ label }) => label), '닫기'];

		showActionSheetWithOptions(
			{
				options: actionOptions,
				cancelButtonIndex: actionOptions.length - 1,
			},
			(buttonIndex) => {
				if (
					buttonIndex === undefined ||
					!OPTIONS[buttonIndex] ||
					buttonIndex === actionOptions.length - 1
				) {
					return;
				}

				setSelectedCollection(OPTIONS[buttonIndex].value);
			},
		);
	};

	return (
		<Layout
			title={isMyProfile ? '작성한 글' : `${profileInfo.displayName}님의 글`}
			containerStyle={{ paddingTop: PADDING }}
			headerStyle={{ paddingBottom: 0 }}
			headerRightComponent={
				<Pressable style={styles.filterButtonContainer} onPress={showOptionSelect}>
					<Text style={styles.filterButtonText}>{selectedOption?.label}</Text>
					<Entypo name='chevron-down' size={16} color={Colors.font_gray} />
				</Pressable>
			}
		>
			<PostList
				collectionName={selectedCollection}
				filter={{ creatorId: profileInfo?.uid }}
				containerStyle={{ paddingHorizontal: PADDING }}
			/>
		</Layout>
	);
};

const styles = StyleSheet.create({
	filterButtonContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 6,
	},
	filterButtonText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.font_gray,
		marginRight: 2,
	},
});

export default MyPosts;

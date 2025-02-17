import { Dispatch, SetStateAction, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import CommentUnit from './CommentUnit';
import { TabNavigation } from '@/types/navigation';

const CommentsList = ({
	postId,
	postCreatorId,
	comments,
	isCommentsUpdated,
	setIsCommentsUpdated,
	containerStyle,
}: {
	postId: string;
	postCreatorId: string;
	comments: string[];
	isCommentsUpdated: boolean;
	setIsCommentsUpdated: Dispatch<SetStateAction<boolean>>;
	containerStyle?: ViewStyle;
}) => {
	const navigation = useNavigation<TabNavigation>();

	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.commentHeader}>댓글 ({[].length})</Text>

			<FlatList
				data={comments}
				keyExtractor={(item) => item.commentId}
				renderItem={({ item }) => <Text>댓글</Text>}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	commentHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});

export default CommentsList;

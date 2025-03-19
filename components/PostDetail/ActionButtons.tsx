import { Colors } from '@/constants/Color';
import { deletePost as deletePostFromDB } from '@/firebase/services/postService';
import { ActionButtonsProps } from '@/types/components';
import { useNavigation } from '@react-navigation/native';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showToast } from '../ui/Toast';

const ActionButtons = ({ id, containerStyles }: ActionButtonsProps) => {
	const stackNavigation = useNavigation<any>();

	const editPost = () => {
		stackNavigation.navigate('NewPost', { id });
	};

	const deletePost = async (id: string) => {
		Alert.alert('게시글 삭제', '정말로 삭제하겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				onPress: async () => await handleDeletePost({ postId: id }),
			},
		]);
	};

	const handleDeletePost = async ({ postId }: { postId: string }) => {
		try {
			await deletePostFromDB(postId);
			showToast('success', '게시글이 삭제되었습니다.');
			stackNavigation.goBack();
		} catch (e) {
			showToast('error', '게시글 삭제 중 오류가 발생했습니다.');
		}
	};

	return (
		<View style={containerStyles}>
			<View style={styles.buttonsContainer}>
				<TouchableOpacity onPress={editPost}>
					<Text style={[styles.editButton, styles.buttonText]}>수정</Text>
				</TouchableOpacity>
				<Text style={styles.divider}>|</Text>
				<TouchableOpacity onPress={() => deletePost(id)}>
					<Text style={[styles.deleteButton, styles.buttonText]}>삭제</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default ActionButtons;

const styles = StyleSheet.create({
	container: {
		position: 'relative',
	},
	buttonsContainer: {
		position: 'absolute',
		top: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 12,
		padding: 6,
	},
	buttonText: {
		color: Colors.font_gray,
		fontSize: 14,
	},
	divider: {
		color: Colors.border_gray,
	},
	editButton: {},
	deleteButton: {},
	completeButton: {},
});

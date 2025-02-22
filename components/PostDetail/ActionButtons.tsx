import { Colors } from '@/constants/Color';
import { ActionButtonsProps } from '@/types/components';
import { HomeStackNavigation } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ActionButtons = ({ id, containerStyles }: ActionButtonsProps) => {
	const stackNavigation = useNavigation<HomeStackNavigation>();

	const showAlert = (title: string, message: string, onPress?: () => void) => {
		Alert.alert(title, message, [{ text: '확인', onPress }]);
	};

	const editPost = () => {
		stackNavigation.navigate('NewPost', { id });
	};

	const deletePost = async (id: string) => {
		Alert.alert('게시글 삭제', '정말로 삭제하겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{ text: '삭제', onPress: handleDeletePost },
		]);
	};

	const handleDeletePost = async () => {
		try {
			await deletePost(id);

			showAlert('삭제 완료', '게시글이 성공적으로 삭제되었습니다.', () =>
				stackNavigation.goBack(),
			);
		} catch (e) {
			showAlert('삭제 실패', '게시글 삭제 중 오류가 발생했습니다.');
			console.log('게시글 삭제 오류:', e);
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

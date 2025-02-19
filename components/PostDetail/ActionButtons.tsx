import { Colors } from '@/constants/Color';
import { TabNavigation } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import {
	Alert,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native';
import { deleteDocFromFirestore } from '../../utilities/firebaseApi';

type ActionButtonsProps = {
	id: string;
	containerStyles?: ViewStyle;
};

const ActionButtons = ({ id, containerStyles }: ActionButtonsProps) => {
	const navigation = useNavigation<TabNavigation>();

	const showAlert = (title: string, message: string, onPress?: () => void) => {
		Alert.alert(title, message, [{ text: '확인', onPress }]);
	};

	const editPost = () => {
		// if (post.done) return;
		navigation.navigate('NewPost', { id });
	};

	const deletePost = async () => {
		Alert.alert('게시글 삭제', '정말로 삭제하겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{ text: '삭제', onPress: handleDeletePost },
		]);
	};

	const handleDeletePost = async () => {
		try {
			await deleteDocFromFirestore({ id });
			showAlert('삭제 완료', '게시글이 성공적으로 삭제되었습니다.', () =>
				navigation.goBack(),
			);
		} catch (e) {
			showAlert('삭제 실패', '게시글 삭제 중 오류가 발생했습니다.');
			console.log('게시글 삭제 오류:', e);
		}
	};

	// const closePost = async () => {
	// if (!userInfo || !id || post.done) return;
	// Alert.alert('거래 완료', '거래 완료로 변경하겠습니까?', [
	// 	{ text: '취소', style: 'cancel' },
	// 	{
	// 		text: '확인',
	// 		onPress: async () => {
	// 			try {
	// 				const docRef = doc(db, 'Boards', id);
	// 				await updateDataToFirestore(docRef, { done: true });
	// 				setIsUpdated(!isUpdated);
	// 			} catch (error) {
	// 				console.log(error);
	// 			}
	// 		},
	// 	},
	// ]);
	// };

	return (
		<View style={containerStyles}>
			<View style={styles.buttonsContainer}>
				<TouchableOpacity onPress={editPost}>
					<Text style={[styles.editButton, styles.buttonText]}>수정</Text>
				</TouchableOpacity>
				<Text style={styles.divider}>|</Text>
				<TouchableOpacity onPress={deletePost}>
					<Text style={[styles.deleteButton, styles.buttonText]}>삭제</Text>
				</TouchableOpacity>
				{/* {!post.done && (
						<TouchableOpacity onPress={closePost}>
							<Text style={[styles.completeButton, styles.buttonText]}>거래 완료</Text>
						</TouchableOpacity>
					)} */}
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

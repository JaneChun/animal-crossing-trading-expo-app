import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { auth } from '@/fbase';
import { TabNavigation } from '@/types/navigation';
import { addComment } from '@/utilities/firebaseApi';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { serverTimestamp } from 'firebase/firestore';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
	Alert,
	Keyboard,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

const CommentInput = ({
	postId,
	setIsLoading,
	commentRefresh,
}: {
	postId: string;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
	commentRefresh: () => void;
}) => {
	const [commentInput, setCommentInput] = useState<string>('');
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const navigation = useNavigation<TabNavigation>();
	const { userInfo } = useAuthContext();

	// 키보드 이벤트 리스너 추가 (키보드 높이 감지)
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			(event) => {
				setKeyboardHeight(event.endCoordinates.height - 235);
			},
		);
		const keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			() => {
				setKeyboardHeight(0);
			},
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	const onSubmit = () => {
		if (!userInfo || !auth.currentUser) {
			Alert.alert('댓글 쓰기는 로그인 후 가능합니다.');
			navigation.navigate('Login');
			return;
		}

		if (!postId) {
			Alert.alert('게시글을 찾을 수 없습니다.');
			navigation.navigate('Login');
			return;
		}

		if (commentInput.trim() === '') {
			Alert.alert('오류', '내용이 비어있는지 확인해주세요.');
			return;
		}

		const commentData = {
			creatorId: userInfo.uid,
			body: commentInput,
			createdAt: serverTimestamp(),
		};

		try {
			setIsLoading(true);
			addComment({ postId, commentData });
			commentRefresh();
		} catch (e: any) {
			Alert.alert(
				'오류',
				`댓글을 작성하는 중 오류가 발생했습니다.${e.code && `\n${e.code}`}`,
			);
		} finally {
			setCommentInput('');
			setIsLoading(false);
		}
	};

	return (
		<View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
			<TextInput
				style={styles.inputText}
				value={commentInput}
				onChangeText={setCommentInput}
				placeholder='댓글을 입력해주세요.'
				multiline
			/>
			<TouchableOpacity style={styles.iconContainer} onPress={onSubmit}>
				<FontAwesome name='send' color={Colors.primary} size={24} />
			</TouchableOpacity>
		</View>
	);
};

export default CommentInput;

const styles = StyleSheet.create({
	inputContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		backgroundColor: 'white',
		flexDirection: 'row',
		alignItems: 'center',
		borderTopWidth: 1,
		borderColor: Colors.border_gray,
	},
	inputText: {
		flex: 1,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		backgroundColor: Colors.base,
		borderRadius: 20,
		paddingVertical: 10,
		paddingHorizontal: 16,
		margin: 8,
		fontSize: 16,
		color: Colors.font_gray,
	},
	iconContainer: {
		marginRight: 24,
	},
});

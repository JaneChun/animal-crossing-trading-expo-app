import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { TabNavigation } from '@/types/navigation';
import React, { useContext, useRef, useState } from 'react';
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { deleteUser, signOut } from 'firebase/auth';
import { updateDocToFirestore } from '../utilities/firebaseApi';
import { auth } from '../fbase';
import useToggle from '@/hooks/useToggle';
import Profile from '@/components/MyPage/Profile';
// import MyPosts from '../Components/MyPosts';

const MyPage = () => {
	const navigation = useNavigation<TabNavigation>();
	const { userInfo } = useAuthContext();
	// const [isEditing, toggleIsEditing] = useToggle(false);
	const [isModalOpen, toggleIsModalOpen] = useToggle(false);
	// const [error, setError] = useState<string | null>(null);

	const onLogOutClick = async () => {
		await signOut(auth);
		// navigation.navigate('Home');
	};

	const onDeleteAccountClick = async () => {
		const user = auth.currentUser;
		Alert.alert(
			'회원 탈퇴',
			'정말로 탈퇴하시겠습니까?\n탈퇴하시면 지금까지 작성한 게시글이 모두 삭제됩니다.',
			[
				{ text: '취소', style: 'cancel' },
				{
					text: '탈퇴',
					onPress: async () => {
						try {
							if (!user) return;
							await updateDocToFirestore({
								id: user.uid,
								collection: 'Users',
								requestData: { isDeletedAccount: true },
							});
							await deleteUser(user);
							Alert.alert('탈퇴되었습니다.');
							// navigation.navigate('Home');
						} catch (error: any) {
							// if (error.code === 'auth/requires-recent-login') {
							// 	setError('다시 로그인 후 시도해주세요.');
							// } else {
							// 	setError('탈퇴 중 오류가 발생했습니다.');
							// }
						}
					},
				},
			],
		);
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{userInfo && (
				<View style={styles.profileCard}>
					{/* Dots Button */}
					<TouchableOpacity
						onPress={toggleIsModalOpen}
						style={styles.dotsButton}
					>
						<Text style={styles.dotsText}>⋮</Text>
					</TouchableOpacity>

					{/* Modal */}
					{/* <Modal isVisible={isModalOpen} onBackdropPress={toggleIsModalOpen}>
						<View style={styles.modalContainer}>
							<TouchableOpacity
								onPress={onLogOutClick}
								style={styles.modalButton}
							>
								<Text style={styles.modalText}>로그아웃</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={onDeleteAccountClick}
								style={styles.modalButton}
							>
								<Text style={styles.modalText}>회원 탈퇴</Text>
							</TouchableOpacity>
						</View>
					</Modal> */}

					{/* Profile Info */}
					<View style={styles.profileContent}>
						<Profile userInfo={userInfo} />
					</View>
				</View>
			)}
			{/* {!isEditing && <MyPosts />} */}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: { flexGrow: 1, alignItems: 'center', padding: 20 },
	error: { color: 'red', marginBottom: 10 },
	profileCard: {
		width: '100%',
		maxWidth: 350,
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
		elevation: 5,
	},
	dotsButton: { position: 'absolute', top: 10, right: 10, padding: 10 },
	dotsText: { fontSize: 20, color: 'gray' },
	modalContainer: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 10,
		alignItems: 'center',
	},
	modalButton: { padding: 10, width: '100%', alignItems: 'center' },
	modalText: { fontSize: 16, fontWeight: 'bold' },
	profileContent: { alignItems: 'center', marginBottom: 20 },
});

export default MyPage;

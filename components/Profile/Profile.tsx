import { Colors } from '@/constants/Color';
import { ProfileProps } from '@/types/components';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import Island from '../ui/Island';
import EditProfileModal from './EditProfileModal';

const Profile = ({
	profileInfo,
	isMyProfile,
	isUploading,
	setIsUploading,
	containerStyle,
}: ProfileProps) => {
	const [isModalVisible, setModalVisible] = useState<boolean>(false);

	const openEditProfileModal = () => {
		setModalVisible(true);
	};

	const closeEditProfileModal = () => {
		setModalVisible(false);
	};

	return (
		<View style={[styles.container, containerStyle]}>
			<View style={styles.imageContainer}>
				<ImageWithFallback
					uri={profileInfo?.photoURL}
					fallbackSource={require('../../assets/images/empty_profile_image.png')}
					style={styles.image}
				/>
			</View>
			<Text style={styles.displayName}>{profileInfo?.displayName}</Text>
			<View style={styles.islandInfoContainer}>
				<Island style={styles.islandIcon} />
				<Text style={styles.islandText}>
					{profileInfo?.islandName || '어떤 섬에 사시나요?'}
				</Text>
			</View>

			{/* 버튼 */}
			{isMyProfile && (
				<View style={styles.buttonsContainer}>
					<Button color='gray' size='md' onPress={openEditProfileModal}>
						프로필 수정
					</Button>
				</View>
			)}

			{isMyProfile && isModalVisible && (
				<EditProfileModal
					isVisible={isModalVisible}
					onClose={closeEditProfileModal}
					isUploading={isUploading}
					setIsUploading={setIsUploading}
				/>
			)}
		</View>
	);
};

export default Profile;

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingVertical: 40,
		alignItems: 'center',
		backgroundColor: 'white',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		elevation: 5,
		shadowColor: Colors.border_gray,
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowOpacity: 1,
		shadowRadius: 2,
	},
	imageContainer: {},
	image: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 16,
	},
	emptyImage: {
		backgroundColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
	},
	displayName: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	islandInfoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	imageEditIndicator: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
	},
	islandIcon: {
		width: 20,
		height: 20,
		marginRight: 2,
	},
	islandText: {
		color: Colors.font_gray,
	},
	buttonsContainer: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 10,
	},
});

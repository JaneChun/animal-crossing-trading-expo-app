import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { ProfileProps } from '@/types/components';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../ui/Button';
import Leaf from '../ui/Icons/Leaf';
import ImageWithFallback from '../ui/ImageWithFallback';

const Profile = ({
	profileInfo,
	isMyProfile,
	containerStyle,
	openEditProfileModal,
}: ProfileProps) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<View style={styles.imageContainer}>
				<ImageWithFallback
					uri={profileInfo?.photoURL}
					fallbackSource={require('../../assets/images/empty_profile_image.png')}
					style={styles.image}
				/>
			</View>
			<View style={styles.nameContainer}>
				<Text style={styles.displayName}>{profileInfo?.displayName}</Text>
				{profileInfo?.badgeGranted && (
					<MaterialIcons
						name='verified'
						color={Colors.icon_primary}
						size={18}
						style={styles.badgeIcon}
					/>
				)}
			</View>
			<View style={styles.islandInfoContainer}>
				<Leaf style={styles.islandIcon} />
				<Text style={styles.islandText}>
					{profileInfo?.islandName || '어떤 섬에 사시나요?'}
				</Text>
			</View>

			{/* 버튼 */}
			{isMyProfile && (
				<View style={styles.buttonsContainer}>
					<Button
						color='white'
						size='lg'
						onPress={openEditProfileModal}
						style={styles.button}
					>
						프로필 수정
					</Button>
				</View>
			)}
		</View>
	);
};

export default Profile;

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingTop: 40,
		paddingBottom: 20,
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
	nameContainer: {
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 22,
		marginBottom: 8,
	},
	displayName: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.bold,
	},
	badgeIcon: {
		position: 'absolute',
		right: 0,
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
		width: '100%',
		marginTop: 24,
	},
	button: {
		borderRadius: 12,
		marginHorizontal: 16,
	},
});

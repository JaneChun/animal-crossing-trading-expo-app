import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { ProfileProps } from '@/types/components';
import emptyProfileImage from '@assets/images/empty_profile_image.png';

import Island from '../ui/Icons/Island';

const Profile = ({
	profileInfo,
	isMyProfile,
	containerStyle,
	openEditProfileModal,
	openImageViewerModal,
}: ProfileProps) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<View style={styles.imageContainer}>
				<Pressable onPress={openImageViewerModal}>
					<ImageWithFallback
						uri={profileInfo?.photoURL}
						fallbackSource={emptyProfileImage}
						style={styles.image}
					/>
				</Pressable>
			</View>
			<View style={styles.nameContainer}>
				<Text style={styles.displayName}>{profileInfo.displayName}</Text>
				{profileInfo?.review?.badgeGranted && (
					<MaterialIcons
						name="verified"
						color={Colors.icon.primary}
						size={18}
						style={styles.badgeIcon}
					/>
				)}
			</View>
			<View style={styles.islandInfoContainer}>
				<Island style={styles.islandIcon} />
				<Text style={styles.islandText}>
					{profileInfo?.islandName || '어떤 섬에 사시나요?'}
				</Text>
			</View>

			{/* 버튼 */}
			{isMyProfile && (
				<View style={styles.buttonsContainer}>
					<Button color="white" size="lg" flex onPress={openEditProfileModal}>
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
		backgroundColor: Colors.bg.primary,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Colors.border.default,
		elevation: 5,
		shadowColor: Colors.border.default,
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
		backgroundColor: Colors.border.default,
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
		color: Colors.text.tertiary,
	},
	buttonsContainer: {
		width: '100%',
		marginTop: 24,
		paddingHorizontal: 16,
	},
});

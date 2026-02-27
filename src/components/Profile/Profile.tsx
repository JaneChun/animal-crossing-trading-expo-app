import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { ProfileProps } from '@/types/components';
import emptyProfileImage from '@assets/images/empty_profile_image.png';
import islandBackgroundImage from '@assets/images/profile/island_background.webp';

import Button from '../ui/Button';
import ChevronStrip from '../ui/Icons/ChevronStrip';
import Island from '../ui/Icons/Island';
import { FRUIT_IMAGES, FRUIT_NAMES } from '@/constants/profile';

const Profile = ({
	profileInfo,
	isMyProfile,
	containerStyle,
	openEditProfileModal,
	openImageViewerModal,
}: ProfileProps) => {
	const fruitName = profileInfo?.fruit ? FRUIT_NAMES[profileInfo?.fruit] : '';
	const fruitImage = profileInfo?.fruit ? FRUIT_IMAGES[profileInfo?.fruit] : '';

	return (
		<View style={[styles.container, containerStyle]}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerLine} />
				<Text style={styles.headerText}>PASSPORT</Text>
				<View style={styles.headerLine} />
			</View>

			{/* Passport Content Body */}
			<View style={styles.body}>
				{/* Main Content Area */}
				<View style={styles.contentRow}>
					{/* Left Image */}
					<View style={styles.imageWrapper}>
						<Pressable onPress={openImageViewerModal}>
							<ImageWithFallback
								uri={profileInfo?.photoURL}
								fallbackSource={emptyProfileImage}
								style={styles.image}
							/>
						</Pressable>
					</View>

					{/* Right Data List */}
					<View style={styles.rightContent}>
						{/* Chat Bubble */}
						<View style={styles.chatBubbleContainer}>
							<View style={styles.chatBubble}>
								<Text style={styles.chatText}>
									{profileInfo?.bio || '한마디를 적어주세요!'}
								</Text>
							</View>
							<View style={styles.chatBubbleTail} />
						</View>

						{/* Island & Fruit */}
						<View style={styles.rowWithDivider}>
							<View style={styles.islandFruitRow}>
								<View style={styles.islandInfoContainer}>
									<Island style={styles.islandIcon} />
									<Text style={styles.islandLabel}>
										{profileInfo?.islandName || '어떤 섬에 사시나요?'}
									</Text>
								</View>
								{fruitName && fruitImage && (
									<View style={styles.islandInfoContainer}>
										<FastImage source={fruitImage} style={styles.islandIcon} />
										<Text style={styles.fruitLabel}>{fruitName}</Text>
									</View>
								)}
							</View>
						</View>

						{/* Title */}
						<View style={styles.rowWithDivider}>
							<View style={styles.titleInfoContainer}>
								<Text style={styles.titleText}>
									{profileInfo?.titleFirst || '초면의'}
								</Text>
								<Text style={styles.titleText}>
									{profileInfo?.titleLast || '이주민'}
								</Text>
							</View>
						</View>

						{/* Name */}
						<View style={styles.nameRow}>
							<Text style={styles.displayName}>{profileInfo.displayName}</Text>
							{profileInfo?.review?.badgeGranted && (
								<MaterialIcons
									name="verified"
									color={Colors.icon.primary}
									size={20}
									style={styles.verifiedIcon}
								/>
							)}
						</View>
					</View>
				</View>

				<FastImage style={styles.islandBackground} source={islandBackgroundImage} />
			</View>

			{/* Footer */}
			<View style={[styles.footer, { alignItems: isMyProfile ? 'center' : 'flex-end' }]}>
				{isMyProfile ? (
					<TouchableOpacity
						onPress={openEditProfileModal}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Feather name="edit-3" size={24} color={Colors.brand.primary} />
					</TouchableOpacity>
				) : (
					<ChevronStrip />
				)}
			</View>
		</View>
	);
};

export default Profile;

const styles = StyleSheet.create({
	container: {
		width: '100%',
		backgroundColor: Colors.bg.primary,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: Colors.border.default,
		overflow: 'hidden',
		elevation: 4,
		shadowColor: Colors.text.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		backgroundColor: Colors.bg.primary,
	},
	headerLine: {
		width: 40,
		height: 1.5,
		backgroundColor: Colors.divider.thick,
	},
	headerText: {
		marginHorizontal: 16,
		fontSize: FontSizes.sm,
		color: Colors.text.tertiary,
		fontWeight: FontWeights.medium,
	},
	body: {
		zIndex: -2,
		backgroundColor: Colors.bg.secondary,
		paddingHorizontal: 12,
		paddingVertical: 16,
		borderLeftWidth: 6,
		borderRightWidth: 6,
		borderColor: Colors.bg.primary,
	},
	islandBackground: {
		zIndex: -1,
		position: 'absolute',
		bottom: -16, // padding bottom
		right: 0,
		width: 150,
		height: 150,
	},
	contentRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	imageWrapper: {
		padding: 6,
		borderWidth: 1,
		borderColor: Colors.border.default,
		backgroundColor: Colors.bg.primary,
		borderRadius: 28,
	},
	image: {
		width: 120,
		height: 120,
		borderRadius: 24,
	},
	rightContent: {
		flex: 1,
		marginLeft: 16,
	},
	chatBubbleContainer: {
		alignSelf: 'flex-start',
		position: 'relative',
		marginBottom: 6,
	},
	chatBubble: {
		backgroundColor: Colors.bg.primary,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		zIndex: 2,
	},
	chatBubbleTail: {
		position: 'absolute',
		bottom: -3,
		left: 2,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: 8,
		borderRightWidth: 8,
		borderBottomWidth: 8,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: Colors.bg.primary,
		transform: [{ rotate: '110deg' }],
	},
	chatText: {
		fontSize: FontSizes.xs,
		color: Colors.text.tertiary,
		fontWeight: FontWeights.regular,
	},
	rowWithDivider: {
		borderBottomWidth: 1.5,
		borderBottomColor: Colors.bg.primary,
		paddingVertical: 8,
	},
	islandFruitRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 8,
	},
	islandInfoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	islandIcon: {
		width: 16,
		height: 16,
		marginRight: 4,
	},
	islandLabel: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.text.secondary,
	},
	fruitLabel: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.text.tertiary,
	},
	titleInfoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 4,
	},
	titleText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.text.secondary,
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
	},
	displayName: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.bold,
		color: Colors.text.primary,
	},
	verifiedIcon: {
		marginLeft: 6,
	},
	footer: {
		height: 50,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		paddingHorizontal: 20,
		backgroundColor: Colors.bg.primary,
	},
});

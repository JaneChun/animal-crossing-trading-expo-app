import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { elapsedTime } from '../../utilities/elapsedTime';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Color';

interface PostUnitProps {
	id: string;
	type: string;
	title: string;
	previewImage: string;
	createdAt: any;
	creatorDisplayName: string;
	creatorId: string;
	// comments?: number;
	// done?: boolean;
}

const PostUnit = ({
	id,
	type,
	title,
	previewImage,
	createdAt,
	creatorDisplayName,
	creatorId,
}: PostUnitProps) => {
	const navigation = useNavigation();

	const navigateToPost = () => {
		// navigation.navigate('PostDetail', { id });
	};

	return (
		<TouchableOpacity style={styles.container} onPress={navigateToPost}>
			{/* 썸네일 */}
			<View style={styles.thumbnailContainer}>
				{previewImage ? (
					<Image
						style={styles.thumbnail}
						source={{
							uri: previewImage,
						}}
					/>
				) : (
					<View style={[styles.thumbnail, styles.emptyThumbnail]}>
						<FontAwesome name='leaf' color={Colors.font_light_gray} size={18} />
					</View>
				)}
			</View>

			{/* 콘텐츠 */}
			<View style={styles.contentContainer}>
				<View style={styles.titleContainer}>
					{/* <Text style={[styles.badge, styles.completedBadge]}>거래 완료</Text> */}
					{type === 'sell' ? (
						<Text style={[styles.badge, styles.sellBadge]}>팔아요</Text>
					) : (
						<Text style={[styles.badge, styles.buyBadge]}>구해요</Text>
					)}
					<Text style={styles.title} numberOfLines={1}>
						{title}
					</Text>
				</View>
				<Text style={styles.infoText}>
					<Text style={styles.creator}>{creatorDisplayName} </Text>
					<Text style={styles.date}> {elapsedTime(createdAt.toDate())}</Text>
				</Text>
			</View>

			{/* 댓글 */}
			{/* <View style={styles.commentContainer}>
				<Text style={styles.commentLabel}>댓글</Text>
				<Text style={styles.commentCount}>{comments}</Text>
			</View> */}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	thumbnailContainer: {
		flexShrink: 0,
	},
	thumbnail: {
		width: 42,
		height: 42,
		borderRadius: 6,
		resizeMode: 'cover',
	},
	emptyThumbnail: {
		backgroundColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
	},
	contentContainer: {
		flex: 1,
		marginLeft: 12,
	},
	titleContainer: {
		height: 30,
		flexDirection: 'row',
		alignItems: 'center',
	},
	title: {
		fontSize: 16,
		fontWeight: 'bold',
		color: Colors.font_black,
	},
	badge: {
		marginRight: 6,
		paddingVertical: 4,
		paddingHorizontal: 8,
		fontSize: 14,
		fontWeight: '500',
		borderRadius: 4,
	},
	// completedBadge: {
	// 	backgroundColor: '#FFF',
	// 	color: '#555',
	// 	borderWidth: 1,
	// 	borderColor: '#DDD',
	// },
	sellBadge: {
		backgroundColor: Colors.blue_background,
		color: Colors.blue_text,
	},
	buyBadge: {
		backgroundColor: Colors.green_background,
		color: Colors.green_text,
	},
	infoText: {
		fontSize: 14,
		marginTop: 4,
	},
	creator: {
		fontWeight: '500',
		color: Colors.font_gray,
	},
	date: {
		fontSize: 14,
		color: Colors.font_light_gray,
	},
	// commentContainer: {
	// 	alignItems: 'center',
	// 	marginLeft: 12,
	// },
	// commentLabel: {
	// 	fontSize: 10,
	// 	color: '#888',
	// },
	// commentCount: {
	// 	fontSize: 14,
	// 	fontWeight: 'bold',
	// 	color: '#333',
	// },
});

export default PostUnit;

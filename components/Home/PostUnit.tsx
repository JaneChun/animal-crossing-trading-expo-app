import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { elapsedTime } from '../../utilities/elapsedTime';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Color';
import { StackNavigation } from '@/types/navigation';
import TypeBadge from './TypeBadge';

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
	const navigation = useNavigation<StackNavigation>();

	const navigateToPost = () => {
		navigation.navigate('PostDetail', { id });
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
					{type === 'sell' ? (
						<TypeBadge type='sell' />
					) : (
						<TypeBadge type='buy' />
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
		fontWeight: 600,
		color: Colors.font_black,
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

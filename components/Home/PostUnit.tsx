import { Colors } from '@/constants/Color';
import { HomeStackNavigation } from '@/types/navigation';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { elapsedTime } from '../../utilities/elapsedTime';
import TypeBadge from './TypeBadge';

type PostUnitProps = {
	id: string;
	type: string;
	title: string;
	previewImage: string;
	createdAt: Timestamp;
	creatorDisplayName: string;
	creatorId: string;
	commentCount: number;
	// done?: boolean;
};

const PostUnit = ({
	id,
	type,
	title,
	previewImage,
	createdAt,
	creatorDisplayName,
	creatorId,
	commentCount,
}: PostUnitProps) => {
	const stackNavigation = useNavigation<HomeStackNavigation>();

	const navigateToPost = () => {
		stackNavigation.navigate('PostDetail', { id });
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
					<Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>
						{title}
					</Text>
				</View>
				<Text style={styles.infoText}>
					<Text style={styles.creator}>{creatorDisplayName} </Text>
					<Text style={styles.date}> {elapsedTime(createdAt)}</Text>
				</Text>
			</View>

			{/* 댓글 */}
			<View style={styles.commentContainer}>
				<Text style={styles.commentLabel}>댓글</Text>
				<Text style={styles.commentCount}>{commentCount}</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 16,
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
		flex: 1,
		height: 30,
		flexDirection: 'row',
		alignItems: 'center',
	},
	title: {
		flexShrink: 1,
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
	commentContainer: {
		width: 50,
		flexDirection: 'column',
		gap: 6,
		alignItems: 'center',
	},
	commentLabel: {
		fontSize: 12,
		fontWeight: 600,
		color: Colors.font_black,
	},
	commentCount: {
		fontSize: 16,
		fontWeight: 'bold',
		color: Colors.font_black,
	},
});

export default PostUnit;

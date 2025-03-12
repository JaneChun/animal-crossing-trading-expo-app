import { Colors } from '@/constants/Color';
import { useNavigationStore } from '@/store/store';
import { PostWithCreatorInfo } from '@/types/post';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { elapsedTime } from '../../utilities/elapsedTime';
import CommunityTypeBadge from '../Community/TypeBadge';
import ItemThumbnail from '../ui/ItemThumbnail';
import Thumbnail from '../ui/Thumbnail';
import MarketTypeBadge from './TypeBadge';

const PostUnit = ({
	id,
	type,
	title,
	images,
	cart,
	createdAt,
	creatorDisplayName,
	commentCount,
}: PostWithCreatorInfo) => {
	const { activeTab } = useNavigationStore();
	const stackNavigation = useNavigation<any>();

	const navigateToPost = () => {
		stackNavigation.navigate('PostDetail', { id });
	};

	return (
		<TouchableOpacity style={styles.container} onPress={navigateToPost}>
			{/* 썸네일 */}
			<View style={styles.thumbnailContainer}>
				{activeTab === 'Home' && (
					<ItemThumbnail
						previewImage={cart?.[0]?.imageUrl}
						itemLength={cart?.length}
					/>
				)}
				{activeTab === 'Community' && <Thumbnail previewImage={images?.[0]} />}
			</View>

			{/* 콘텐츠 */}
			<View style={styles.contentContainer}>
				<View style={styles.titleContainer}>
					{activeTab === 'Home' && <MarketTypeBadge type={type} />}
					{activeTab === 'Community' && <CommunityTypeBadge type={type} />}
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
		// borderWidth: 1,
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

import { Colors } from '@/constants/Color';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { Post } from '@/types/post';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CommunityTypeBadge from '../Community/TypeBadge';
import MarketTypeBadge from '../Home/TypeBadge';
import ItemThumbnail from '../ui/ItemThumbnail';
import Thumbnail from '../ui/Thumbnail';

const PostSummary = ({ id, type, title, images, cart, createdAt }: Post) => {
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const isMarket = activeTab === 'Home' || activeTab === 'Profile';
	const isCommunity = activeTab === 'Community';

	const stackNavigation = useNavigation<any>();

	const navigateToPost = () => {
		stackNavigation.navigate('PostDetail', { id });
	};

	return (
		<TouchableOpacity style={styles.container} onPress={navigateToPost}>
			{/* 썸네일 */}
			<View style={styles.thumbnailContainer}>
				{isMarket && (
					<ItemThumbnail
						previewImage={cart?.[0]?.imageUrl}
						itemLength={cart?.length}
					/>
				)}
				{isCommunity && <Thumbnail previewImage={images?.[0]} />}
			</View>

			{/* 콘텐츠 */}
			<View style={styles.infoContainer}>
				<View style={styles.titleContainer}>
					{isMarket && <MarketTypeBadge type={type} />}
					{isCommunity && <CommunityTypeBadge type={type} />}
					<Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>
						{title}
					</Text>
				</View>
			</View>

			{/* 아이콘 */}
			<View>
				<Ionicons
					name='arrow-forward-circle-outline'
					size={24}
					color={Colors.primary}
				/>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16,
		height: 70,
		borderColor: Colors.border_gray,
		borderWidth: 1,
		backgroundColor: 'white',
		borderRadius: 8,
	},
	thumbnailContainer: {
		flexShrink: 0,
	},
	infoContainer: {
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
});

export default PostSummary;

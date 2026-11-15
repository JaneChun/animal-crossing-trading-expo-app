import { StyleSheet, View } from 'react-native';

import { SkeletonBox, SkeletonCircle } from '@/components/ui/skeleton';
import { Theme, useThemedStyles } from '@/theme';
import { Collection } from '@/types/post';

const PostSummarySkeleton = ({ collectionName }: { collectionName: Collection }) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.container}>
			{/* 실제 썸네일과 모양을 맞춘다: 거래 글은 ItemThumbnail(42 원형), 커뮤니티 글은 Thumbnail(50 사각형) */}
			{collectionName === 'Boards' ? (
				<SkeletonCircle size={42} />
			) : (
				<SkeletonBox width={50} height={50} borderRadius={6} />
			)}
			<View style={styles.titleContainer}>
				<SkeletonBox width={40} height={20} />
				<SkeletonBox width="60%" height={18} />
			</View>
			<SkeletonCircle size={24} />
		</View>
	);
};

export default PostSummarySkeleton;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 16,
			height: 70,
			backgroundColor: colors.bg.raised,
			borderRadius: 8,
		},
		titleContainer: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			marginHorizontal: 12,
		},
	});

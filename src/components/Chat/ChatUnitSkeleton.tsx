import { StyleSheet, View } from 'react-native';

import { SkeletonBox, SkeletonCircle } from '@/components/ui/skeleton';
import { Colors } from '@/theme/Color';

const ChatUnitSkeleton = () => (
	<View style={styles.container}>
		<SkeletonCircle size={50} />
		<View style={styles.body}>
			<View style={styles.title}>
				<SkeletonBox width={100} height={20} />
				<SkeletonBox width={55} height={14} />
			</View>
			<View style={styles.content}>
				<SkeletonBox width="80%" height={16} />
			</View>
		</View>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border.default,
	},
	body: {
		flex: 1,
		marginLeft: 12,
	},
	title: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	content: {
		marginTop: 4,
	},
});

export default ChatUnitSkeleton;

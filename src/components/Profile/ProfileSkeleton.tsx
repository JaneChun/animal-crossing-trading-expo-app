import { StyleSheet, Text, View } from 'react-native';

import { SkeletonBox } from '@/components/ui/skeleton';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';

import ChevronStrip from '../ui/Icons/ChevronStrip';

const ProfileSkeleton = () => (
	<View style={styles.container}>
		{/* Header */}
		<View style={styles.header}>
			<View style={styles.headerLine} />
			<Text style={styles.headerText}>PASSPORT</Text>
			<View style={styles.headerLine} />
		</View>

		{/* Body */}
		<View style={styles.body}>
			<View style={styles.contentRow}>
				{/* Profile image */}
				<View style={styles.imageWrapper}>
					<SkeletonBox width={120} height={120} borderRadius={24} />
				</View>

				{/* Right content */}
				<View style={styles.rightContent}>
					<SkeletonBox
						width="80%"
						height={24}
						borderRadius={12}
						style={styles.chatBubble}
					/>
					<View style={styles.rowWithDivider}>
						<SkeletonBox width="90%" height={18} />
					</View>
					<View style={styles.rowWithDivider}>
						<SkeletonBox width="60%" height={18} />
					</View>
					<View style={styles.nameRow}>
						<SkeletonBox width={100} height={22} />
					</View>
				</View>
			</View>
		</View>

		{/* Footer */}
		<View style={styles.footer}>
			<ChevronStrip />
		</View>
	</View>
);

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
		backgroundColor: Colors.bg.secondary,
		paddingHorizontal: 12,
		paddingVertical: 16,
		borderLeftWidth: 6,
		borderRightWidth: 6,
		borderColor: Colors.bg.primary,
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
	rightContent: {
		flex: 1,
		marginLeft: 16,
	},
	chatBubble: {
		marginBottom: 4,
	},
	rowWithDivider: {
		borderBottomWidth: 1.5,
		borderBottomColor: Colors.bg.primary,
		paddingVertical: 8,
	},
	nameRow: {
		paddingVertical: 8,
	},
	footer: {
		height: 50,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
		paddingHorizontal: 20,
		backgroundColor: Colors.bg.primary,
	},
});

export default ProfileSkeleton;

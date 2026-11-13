import { StyleSheet, View } from 'react-native';

import { SkeletonBox } from '@/components/ui/skeleton';
import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';

import ChevronStrip from '../ui/Icons/ChevronStrip';

const ProfileSkeleton = () => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerLine} />
				<Text variant="body2" weight="medium" color="tertiary" style={styles.headerText}>
					PASSPORT
				</Text>
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
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			width: '100%',
			backgroundColor: colors.bg.primary,
			borderRadius: 16,
			borderWidth: 1,
			borderColor: colors.border.default,
			overflow: 'hidden',
			elevation: 4,
			shadowColor: colors.text.primary,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 8,
		},
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 12,
			backgroundColor: colors.bg.primary,
		},
		headerLine: {
			width: 40,
			height: 1.5,
			backgroundColor: colors.divider.thick,
		},
		headerText: {
			marginHorizontal: 16,
		},
		body: {
			backgroundColor: colors.bg.secondary,
			paddingHorizontal: 12,
			paddingVertical: 16,
			borderLeftWidth: 6,
			borderRightWidth: 6,
			borderColor: colors.bg.primary,
		},
		contentRow: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		imageWrapper: {
			padding: 6,
			borderWidth: 1,
			borderColor: colors.border.default,
			backgroundColor: colors.bg.primary,
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
			borderBottomColor: colors.bg.primary,
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
			backgroundColor: colors.bg.primary,
		},
	});

export default ProfileSkeleton;

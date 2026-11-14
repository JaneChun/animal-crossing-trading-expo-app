import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Island from '@/components/ui/Icons/Island';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { PublicUserInfo } from '@/types/user';
import emptyProfileImage from '@assets/images/empty_profile_image.png';

type UserRowProps = {
	user: Pick<PublicUserInfo, 'displayName' | 'islandName' | 'photoURL'>;
	onPress?: () => void;
	/** 이름 옆 배지 */
	nameAccessory?: ReactNode;
	/** 오른쪽 슬롯: chevron, 배지, 시간 */
	right?: ReactNode;
	/** 목록 행이면 true. 좌우 여백과 아래 구분선을 그린다 */
	isListItem?: boolean;
};

const UserRow = ({ user, onPress, nameAccessory, right, isListItem = false }: UserRowProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<Pressable
			style={[styles.row, isListItem && styles.listItem]}
			onPress={onPress}
			disabled={!onPress}
		>
			<ImageWithFallback
				uri={user.photoURL}
				fallbackSource={emptyProfileImage}
				style={styles.avatar}
			/>
			<View style={styles.body}>
				<View style={styles.nameRow}>
					<Text variant="body1" weight="semibold" numberOfLines={1} style={styles.name}>
						{user.displayName}
					</Text>
					{nameAccessory}
				</View>
				{!!user.islandName && (
					<View style={styles.islandRow}>
						<Island style={styles.islandIcon} />
						<Text variant="body2" weight="light" color="tertiary">
							{user.islandName}
						</Text>
					</View>
				)}
			</View>
			{right}
		</Pressable>
	);
};

export default UserRow;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.m,
			paddingVertical: Spacing.m,
		},
		listItem: {
			paddingHorizontal: Spacing.xxl,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
		},
		avatar: {
			width: 50,
			height: 50,
			borderRadius: 25,
		},
		body: {
			flex: 1,
		},
		nameRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
		},
		name: {
			flexShrink: 1,
		},
		islandRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.xxs,
			marginTop: Spacing.xs,
		},
		islandIcon: {
			width: 16,
			height: 16,
		},
	});

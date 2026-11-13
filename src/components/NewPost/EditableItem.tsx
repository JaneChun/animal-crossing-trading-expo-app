import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Bell from '@/components/ui/Icons/Bell';
import MileTicket from '@/components/ui/Icons/MileTicket';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';
import { EditableItemProps } from '@/types/components';

const EditableItem = ({ item, readonly = false, onDeleteItem }: EditableItemProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={[styles.container, readonly && styles.readOnlyContainer]}>
			{/* 이미지 */}
			<ImageWithFallback uri={item.imageUrl} style={styles.image} />

			<View style={styles.body}>
				<Text variant="body1" weight="semibold" numberOfLines={1} ellipsizeMode="tail">
					{item.name}
				</Text>
				{item.color && (
					<Text variant="body2" color="tertiary">
						{item.color}
					</Text>
				)}

				<View style={styles.quantityContainer}>
					<Text variant="body2" color="tertiary">
						{item.price}
						{item.unit === 'bell' ? '덩' : '마일'}
					</Text>
					<Ionicons name="close" size={14} color={styles.closeIcon.color} />
					<Text variant="body2" color="tertiary">
						{item.quantity}
					</Text>
				</View>
			</View>

			{/* 테일 */}
			<View style={styles.priceContainer}>
				{item.unit === 'bell' ? (
					<Bell style={styles.ticketIcon} />
				) : (
					<MileTicket style={[styles.ticketIcon, { marginRight: 1 }]} />
				)}
				<Text variant="body2">{item.quantity * item.price}</Text>
			</View>

			{!readonly && onDeleteItem && (
				<TouchableOpacity
					style={styles.deleteButton}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					onPress={() => onDeleteItem(item.id)}
				>
					<FontAwesome6 name="circle-minus" size={22} color={styles.deleteIcon.color} />
				</TouchableOpacity>
			)}
		</View>
	);
};

export default EditableItem;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingVertical: 12,
			paddingHorizontal: 16,
			backgroundColor: colors.bg.primary,
			borderWidth: 1,
			borderColor: colors.border.default,
			borderRadius: 16,
			marginBottom: 12,
		},
		readOnlyContainer: {
			backgroundColor: colors.bg.fill,
			borderWidth: 0,
		},
		body: {
			flex: 1,
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'flex-start',
			gap: 5,
		},
		image: {
			width: 30,
			height: 30,
			borderRadius: 8,
			marginRight: 12,
		},
		closeIcon: {
			color: colors.text.tertiary,
		},
		quantityContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 1,
		},
		priceContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 4,
			gap: 1,
		},
		ticketIcon: {
			width: 20,
			height: 20,
		},
		deleteIcon: {
			color: colors.brand.primary,
		},
		deleteButton: {
			padding: 6,
			paddingRight: 0,
		},
	});

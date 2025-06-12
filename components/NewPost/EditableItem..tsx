import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { EditableItemProps } from '@/types/components';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native';
import Bell from '../ui/Icons/Bell';
import MileTicket from '../ui/Icons/MileTicket';
import ImageWithFallback from '../ui/ImageWithFallback';

const EditableItem = ({
	item,
	readonly = false,
	onDeleteItem,
}: EditableItemProps) => {
	const readOnlyContainer: ViewStyle = {
		backgroundColor: Colors.base,
		borderWidth: 0,
	};

	return (
		<View style={[styles.container, readonly && readOnlyContainer]}>
			{/* 이미지 */}
			<ImageWithFallback uri={item.imageUrl} style={styles.image} />

			{/* 본문 */}
			<View style={styles.body}>
				<Text style={styles.name} numberOfLines={1} ellipsizeMode='tail'>
					{item.name}
				</Text>
				{item.color && <Text style={styles.color}>{item.color}</Text>}

				<View style={styles.quantityContainer}>
					<Text style={styles.quantity}>
						{item.price}
						{item.unit === 'bell' ? '벨' : '마일'}
					</Text>
					<Ionicons name='close' size={14} color={Colors.font_gray} />
					<Text style={styles.quantity}>{item.quantity}</Text>
				</View>
			</View>

			{/* 테일 */}
			<View style={styles.priceContainer}>
				{item.unit === 'bell' ? (
					<Bell style={styles.ticketIcon} />
				) : (
					<MileTicket style={[styles.ticketIcon, { marginRight: 1 }]} />
				)}
				<Text style={styles.price}>{item.quantity * item.price}</Text>
			</View>

			{!readonly && onDeleteItem && (
				<TouchableOpacity
					style={styles.deleteButton}
					onPress={() => onDeleteItem(item.id)}
				>
					<FontAwesome6 name='circle-minus' size={22} color={Colors.primary} />
				</TouchableOpacity>
			)}
		</View>
	);
};

export default EditableItem;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 16,
		marginBottom: 12,
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
		borderRadius: 15,
		marginRight: 12,
	},
	name: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
	},
	color: {
		fontSize: FontSizes.sm,
		color: Colors.font_gray,
	},
	quantity: {
		fontSize: FontSizes.sm,
		color: Colors.font_gray,
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
	price: {
		color: Colors.font_black,
	},
	deleteButton: {
		padding: 6,
		paddingRight: 0,
	},
});

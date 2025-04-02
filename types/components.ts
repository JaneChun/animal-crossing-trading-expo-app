import { VALIDATION_RULES } from '@/utilities/validateInput';
import { ImagePickerAsset } from 'expo-image-picker';
import { Timestamp } from 'firebase/firestore';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import {
	GestureResponderEvent,
	StyleProp,
	TextStyle,
	ViewStyle,
} from 'react-native';
import { Comment, CommentWithCreatorInfo } from './comment';
import { NotificationWithReceiverInfo } from './notification';
import { CartItem, Type } from './post';

// Home/
export type Collection = 'Boards' | 'Communities';
export type Tab = 'Home' | 'Community' | 'Chat' | 'Profile';

export type PostListProps = {
	collectionName: Collection;
	filter?: { category?: string; creatorId?: string };
	isAddPostButtonVisible?: boolean;
};

export type TypeBadgeProps = {
	type: Type;
	containerStyle?: ViewStyle;
};

export type BadgeProps = {
	text: string;
	textColor: string;
	bgColor: string;
	containerStyle?: ViewStyle;
};

export type ThumabnailProps = {
	previewImage?: string;
};

export type ItemThumabnailProps = ThumabnailProps & { itemLength?: number };

// NewPost/
export type TypeSelectProps = {
	type: Type;
	setType: Dispatch<SetStateAction<Type>>;
};

export type TitleInputProps = {
	title: string;
	setTitle: Dispatch<SetStateAction<string>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
	inputStyle?: StyleProp<TextStyle>;
	isSubmitted: boolean;
};

export type BodyInputProps = {
	body: string;
	setBody: Dispatch<SetStateAction<string>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
	inputStyle?: StyleProp<TextStyle>;
	isSubmitted: boolean;
};

export type ImageInputProps = {
	images: ImagePickerAsset[];
	setImages: Dispatch<SetStateAction<ImagePickerAsset[]>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
};

export type CartItemProps = {
	item: CartItem;
	updateItem: (updateCartItem: CartItem) => void;
	deleteItemFromCart: (deleteCartItemId: string) => void;
};

export type ItemListProps = {
	cart: CartItem[];
	setCart: Dispatch<SetStateAction<CartItem[]>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
};

export type ItemSelectProps = {
	cart: CartItem[];
	setCart: Dispatch<SetStateAction<CartItem[]>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
};

export type EditableItemProps = {
	item: CartItem;
	readonly?: boolean;
	onDeleteItem?: (deleteCartItemId: string) => void;
};

export type EditItemModalProps = {
	item: CartItem | null;
	isVisible: boolean;
	onUpdate: (updatedCartItem: CartItem) => void;
	onClose: () => void;
};

// PostDetail/
export type BodyProps = {
	body: string;
	containerStyle?: ViewStyle;
};

export type CommentInputProps = {
	postId: string;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
	commentRefresh: () => void;
};

export type CommentsListProps = {
	postId: string;
	postCreatorId: string;
	comments: Comment[];
	containerStyle?: ViewStyle;
	commentRefresh: () => void;
};

export interface CommentUnitProps extends CommentWithCreatorInfo {
	commentRefresh: () => void;
	postId: string;
	postCreatorId: string;
}

export type CreatedAtProps = {
	createdAt: Timestamp;
	containerStyle?: ViewStyle;
};

export type ImageCarouselProps = {
	images?: string[];
	containerStyle?: ViewStyle;
};

export type ItemSummaryListProps = {
	cart?: CartItem[];
	containerStyle?: ViewStyle;
};

export type TitleProps = {
	title: string;
	containerStyle?: ViewStyle;
};

export type TotalProps = {
	cart?: CartItem[];
	containerStyle?: ViewStyle;
};

export type UserInfoProps = {
	displayName: string;
	islandName: string;
	containerStyle?: ViewStyle;
};

// Notification/
export type NotificationUnitProp = {
	tab: 'Market' | 'Community';
	item: NotificationWithReceiverInfo;
};

export type NoticeTabProps = {
	notifications: NotificationWithReceiverInfo[];
};

export type TabBarLabelProps = {
	label: string;
	hasUnread: boolean;
};

// Chat/
export type Message = {
	id: string;
	body: string;
	senderId: string;
	receiverId: string;
	createdAt: Timestamp;
	isReadBy: string[];
};

// Profile/
export type ProfileProps = {
	isUploading: boolean;
	setIsUploading: Dispatch<SetStateAction<boolean>>;
};

export type EditProfileModalProps = ProfileProps & {
	isVisible: boolean;
	onClose: () => void;
};

export type NameInputProp = ValidationInputProp & { label: string };

export type ProfileImageInputProps = {
	image: ImagePickerAsset | null;
	setImage: Dispatch<SetStateAction<ImagePickerAsset | null>>;
};

// ui/
export type ButtonColor = 'mint' | 'white' | 'gray';
export type ButtonSize = 'sm' | 'md' | 'md2' | 'lg';
export type ButtonProps = {
	children: React.ReactNode;
	onPress: (event: GestureResponderEvent) => void;
	color: ButtonColor;
	size: ButtonSize;
	style?: object;
	disabled?: boolean;
};

export type ValidationInputProp = {
	type: keyof typeof VALIDATION_RULES;
	input: string;
	setInput: Dispatch<SetStateAction<string>>;
	placeholder?: string;
	inputStyle?: StyleProp<TextStyle>;
	multiline?: boolean;
	isSubmitted: boolean;
};

export type InputProps = {
	input: string;
	setInput: Dispatch<SetStateAction<string>>;
	onPress: () => void;
	placeholder?: string;
	marginBottom?: number;
};

export type LayoutProps = {
	children: ReactNode;
	title?: string;
};

export type Category = { EN: string; KR: string };

export type CategoriesProps = {
	categories: Category[];
	category: string;
	setCategory: Dispatch<SetStateAction<string>>;
};

export type Currency = 'mileticket' | 'bell';

export type DropdownOption = {
	text: string;
	value: string;
};

export type DropdownOptionProps = {
	options: DropdownOption[];
	disabled?: boolean;
	value: string;
	setValue: Dispatch<SetStateAction<string>>;
};

export type ActionSheetButtonProps = {
	color: string;
	size: number;
	options: { label: string; onPress: () => void }[];
	cancelIndex?: number;
};

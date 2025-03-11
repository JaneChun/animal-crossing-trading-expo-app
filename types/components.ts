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
import { CartItem, PostWithCreatorInfo, Type } from './post';

// Home/
export type Tab = 'market' | 'community';

export type PostListProps = {
	tab: Tab;
};

export type PostUnitProps = PostWithCreatorInfo & {
	tab: Tab;
	previewImage?: string;
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
export type ActionButtonsProps = {
	id: string;
	containerStyles?: ViewStyle;
};

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

// Profile/
export type EditProfileModalProps = {
	isVisible: boolean;
	onClose: () => void;
};

export type NameInputProp = ValidationInputProp & { label: string };

export type MyPostsProps = {
	data: PostWithCreatorInfo[];
	isLoading: boolean;
	isEnd: boolean;
	loadMore: () => void;
};

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

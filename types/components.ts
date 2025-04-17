import { VALIDATION_RULES } from '@/utilities/validateInput';
import { ImagePickerAsset } from 'expo-image-picker';
import { Timestamp } from 'firebase/firestore';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import {
	GestureResponderEvent,
	ImageProps,
	StyleProp,
	TextStyle,
	ViewStyle,
} from 'react-native';
import { CommentWithCreatorInfo } from './comment';
import { NotificationWithReceiverInfo } from './notification';
import {
	CartItem,
	Category,
	CategoryItem,
	Collection,
	CommunityType,
	MarketType,
	Post,
	PostWithCreatorInfo,
} from './post';
import { PublicUserInfo } from './user';

// Home/
export type PostListProps = {
	collectionName: Collection;
	filter?: { category?: string; creatorId?: string };
	isAddPostButtonVisible?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
};

export type PostUnitProps<C extends Collection> = {
	post: PostWithCreatorInfo<C>;
	collectionName: C;
};

export type TypeBadgeProps<T extends MarketType | CommunityType> = {
	type: T;
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
export interface PostFormState {
	type: MarketType | CommunityType;
	title: string;
	body: string;
	images: ImagePickerAsset[];
	cart: CartItem[];
	originalImageUrls: string[];
}
export interface PostFormHandlers {
	setType: Dispatch<SetStateAction<MarketType | CommunityType>>;
	setTitle: Dispatch<SetStateAction<string>>;
	setBody: Dispatch<SetStateAction<string>>;
	setImages: Dispatch<SetStateAction<ImagePickerAsset[]>>;
	setCart: Dispatch<SetStateAction<CartItem[]>>;
	setOriginalImageUrls: Dispatch<SetStateAction<string[]>>;
}
export interface PostForm extends PostFormState, PostFormHandlers {}

export interface PostFormFieldsProps {
	form: PostForm;
	isSubmitted: boolean;
	dropdownOptions: DropdownOption[];
}

export type TypeSelectProps = {
	type: MarketType;
	setType: Dispatch<SetStateAction<MarketType>>;
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
	setIsCommentUploading: Dispatch<SetStateAction<boolean>>;
};

export type CommentsListProps = {
	postId: string;
	postCreatorId: string;
	comments: CommentWithCreatorInfo[];
	containerStyle?: ViewStyle;
};

export interface CommentUnitProps extends CommentWithCreatorInfo {
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
	userId: string;
	displayName: string;
	islandName: string;
	containerStyle?: ViewStyle;
};

// Notification/
export type NotificationUnitProp = {
	item: NotificationWithReceiverInfo;
	collectionName: Collection;
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
	profileInfo: PublicUserInfo;
	isMyProfile: boolean;
	isUploading: boolean;
	setIsUploading: Dispatch<SetStateAction<boolean>>;
	containerStyle?: StyleProp<ViewStyle>;
};

export type PostSummaryProps<C extends Collection> = {
	post: Post<C>;
	collectionName: C;
};

export type EditProfileModalProps = {
	isVisible: boolean;
	onClose: () => void;
	isUploading: boolean;
	setIsUploading: Dispatch<SetStateAction<boolean>>;
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
	containerStyle?: StyleProp<ViewStyle>;
	title?: string;
	titleRightComponent?: React.ReactNode;
};

export type CategoriesProps = {
	categories: CategoryItem[];
	category: Category;
	setCategory: Dispatch<SetStateAction<Category>>;
	containerStyle?: StyleProp<ViewStyle>;
};

export type Currency = 'mileticket' | 'bell';

export type DropdownOption = {
	text: string;
	value: string;
};

export type DropdownOptionProps = {
	options: DropdownOption[];
	disabled?: boolean;
	value: CommunityType;
	setValue: Dispatch<SetStateAction<CommunityType>>;
};

export type ActionSheetButtonProps = {
	color: string;
	size: number;
	options: { label: string; onPress: () => void }[];
	cancelIndex?: number;
};

export type ImagePriority = 'low' | 'normal' | 'high';

export interface ImageWithFallbackProps extends Omit<ImageProps, 'source'> {
	uri?: string;
	fallbackSource?: number; // require() 등 로컬 이미지
	style?: any;
	priority?: ImagePriority;
}

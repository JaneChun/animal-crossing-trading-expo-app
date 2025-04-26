import { ICON_MAP } from '@/components/ui/EmptyIndicator';
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
import { ImageType } from './image';
import { NotificationWithSenderInfo } from './notification';
import {
	CartItem,
	Collection,
	CommunityType,
	Item,
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
	images: ImageType[];
	cart: CartItem[];
	originalImageUrls: string[];
}
export interface PostFormHandlers {
	setType: Dispatch<SetStateAction<MarketType | CommunityType>>;
	setTitle: Dispatch<SetStateAction<string>>;
	setBody: Dispatch<SetStateAction<string>>;
	setImages: Dispatch<SetStateAction<ImageType[]>>;
	setCart: Dispatch<SetStateAction<CartItem[]>>;
	setOriginalImageUrls: Dispatch<SetStateAction<string[]>>;
}
export interface PostForm extends PostFormState, PostFormHandlers {}

export interface PostFormFieldsProps {
	form: PostForm;
	isSubmitted: boolean;
	dropdownOptions: DropdownOption[];
	handleEditItemPress: (item: CartItem) => void;
	deleteItemFromCart: (deleteCartItemId: string) => void;
}

export type TypeSelectProps = {
	type: MarketType;
	setType: Dispatch<SetStateAction<MarketType>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
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
	images: ImageType[];
	setImages: Dispatch<SetStateAction<ImageType[]>>;
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
	handleEditItemPress: (item: CartItem) => void;
	deleteItemFromCart: (deleteCartItemId: string) => void;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
};

export type ItemSelectProps = {
	cart: CartItem[];
	setCart: Dispatch<SetStateAction<CartItem[]>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
};

export type ItemSelectItemProps = {
	item: Item;
	searchInput: string;
	addItemToCart: (item: Item) => void;
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
	item: NotificationWithSenderInfo;
	collectionName: Collection;
};

export type NoticeTabProps = {
	notifications: NotificationWithSenderInfo[];
};

export type TabBarLabelProps = {
	label: string;
	hasUnread: boolean;
};

// Profile/
export type ProfileProps = {
	profileInfo: PublicUserInfo;
	isMyProfile: boolean;
	containerStyle?: StyleProp<ViewStyle>;
	openEditProfileModal: () => void;
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

// Search/
export type SearchResultItemProps = {
	item: Item;
	searchInput: string;
};

// ui/
export type ButtonColor = 'mint' | 'white' | 'gray';
export type ButtonSize = 'sm' | 'md' | 'md2' | 'lg' | 'lg2';
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
	headerStyle?: StyleProp<ViewStyle>;
	title?: string;
	headerRightComponent?: React.ReactNode;
};

export type LayoutWithHeaderProps = {
	headerCenterComponent?: ReactNode;
	headerRightComponent?: ReactNode;
	children: ReactNode;
	hasBorderBottom?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
};

export type CategoriesProps<T, U> = {
	categories: readonly U[];
	category: T;
	setCategory: Dispatch<SetStateAction<T>>;
	containerStyle?: StyleProp<ViewStyle>;
};

export type DropdownOption = {
	text: string;
	value: string;
};

export type DropdownOptionProps = {
	options: DropdownOption[];
	value: string;
	setValue: Dispatch<SetStateAction<string>>;
	disabled?: boolean;
};

export type NumberInputProps = {
	value: number;
	setValue: Dispatch<SetStateAction<number>>;
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

export type HighlightMatchProps = {
	text: string;
	keyword: string;
	textStyle: TextStyle;
	highlightTextStyle: TextStyle;
};

export type ImagePreviewProps = {
	uri: string;
	onDelete: (uri: string) => void;
};

export type AddImageButtonProps = {
	count: number;
	totalCount: number;
	onPress: () => void;
};

type IconType = keyof typeof ICON_MAP;

export type EmptyIndicatorProps = {
	iconType?: IconType;
	iconName?: any;
	message: string;
};

export type SearchIconProps = {
	color?: string;
	size?: number;
	containerStyle?: ViewStyle;
};

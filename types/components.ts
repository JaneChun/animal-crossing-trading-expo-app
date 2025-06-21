import { ICON_MAP } from '@/components/ui/EmptyIndicator';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ImagePickerAsset } from 'expo-image-picker';
import { Timestamp } from 'firebase/firestore';
import { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';
import {
	GestureResponderEvent,
	ImageProps,
	StyleProp,
	TextInput,
	TextInputProps,
	TextStyle,
	ViewStyle,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { CommentWithCreatorInfo } from './comment';
import { PopulatedNotification } from './notification';
import {
	CartItem,
	Collection,
	CommunityType,
	Filter,
	Item,
	MarketType,
	Post,
	PostWithCreatorInfo,
} from './post';
import { OauthType, PublicUserInfo } from './user';

// Home/
export type PostListProps = {
	collectionName: Collection;
	filter?: Filter;
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
export interface PostFormProps {
	collectionName: Collection;
	flatListRef: RefObject<FlatList<any>>;
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
};

export type BodyInputProps = {
	body: string;
	setBody: Dispatch<SetStateAction<string>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
	inputStyle?: StyleProp<TextStyle>;
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
	handleEditItemPress: (item: CartItem) => void;
	deleteItemFromCart: (deleteCartItemId: string) => void;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
};

export type ItemSelectProps = {
	cart: CartItem[];
	addItemToCart: (item: Item) => void;
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
	updateItemFromCart: (updatedCartItem: CartItem) => void;
	onClose: () => void;
};

export type AddItemModalProps = {
	cart: CartItem[];
	addItemToCart: (item: Item) => void;
	isVisible: boolean;
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
	setShouldScroll: Dispatch<SetStateAction<boolean>>;
};

export type CommentsListProps = {
	postId: string;
	postCreatorId: string;
	comments: CommentWithCreatorInfo[];
	chatRoomIds: string[];
	containerStyle?: ViewStyle;
	scrollToBottom: () => void;
	openReportModal: (params: OpenReportModalParams) => void;
};

type OpenReportModalParams = {
	commentId: string;
	reporteeId: string;
};

export interface CommentUnitProps extends CommentWithCreatorInfo {
	postId: string;
	postCreatorId: string;
	chatRoomIds: string[];
	openReportModal: (params: OpenReportModalParams) => void;
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
	item: PopulatedNotification;
	collectionName: Collection;
};

export type NoticeTabProps = {
	notifications: PopulatedNotification[];
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

export type NameInputProp = ValidationInputProp & {
	type: string;
	label: string;
};

export type ProfileImageInputProps = {
	image: ImagePickerAsset | null;
	setImage: Dispatch<SetStateAction<ImagePickerAsset | null>>;
};

// Search/
export type SearchResultItemProps = {
	item: Item;
	searchInput: string;
};

export type SearchInputProps = {
	searchInput: string;
	onChangeText: (text: string) => void;
	resetSearchInput: () => void;
	onSubmit: (keyword: string) => void;
	containerStyle?: ViewStyle;
	placeholder?: string;
	InputComponent?: typeof TextInput | typeof BottomSheetTextInput;
};

// Chat/
export type ChatInputProps = {
	disabled: boolean;
	onSubmit: (input: string) => void;
};

// ui/
export type ButtonColor = 'mint' | 'white' | 'gray';
export type ButtonSize = 'sm' | 'md' | 'md2' | 'lg' | 'lg2';
export type ButtonProps = {
	children: React.ReactNode;
	onPress: (event: GestureResponderEvent) => void;
	color: ButtonColor;
	size: ButtonSize;
	flex?: boolean;
	style?: object;
	disabled?: boolean;
};

export type ValidationInputProp = TextInputProps & {
	inputStyle?: StyleProp<TextStyle>;
	errorMessageContainerStyle?: StyleProp<ViewStyle>;
	errorMessage?: string;
	InputComponent?: typeof TextInput | typeof BottomSheetTextInput;
};

export type InputProps = {
	input: string;
	setInput: Dispatch<SetStateAction<string>>;
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
	placeholder?: string;
	disabled?: boolean;
	disabledPlaceHolder?: string;
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

export type DropdownInputProps = {
	options: DropdownOption[];
	value: string;
	setValue: Dispatch<SetStateAction<string>>;
	disabled?: boolean;
	topOffset?: number;
	style?: StyleProp<ViewStyle>;
};

export type NumberInputProps = {
	value: number;
	setValue: Dispatch<SetStateAction<number>>;
	InputComponent?: typeof TextInput | typeof BottomSheetTextInput;
	style?: StyleProp<ViewStyle>;
};

export type ActionSheetButtonProps = {
	color: string;
	size: number;
	options: { label: string; onPress: () => void }[];
	destructiveButtonIndex?: number;
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

export type SocialLoginButtonProps = {
	oauthType: OauthType;
	onPress: () => void;
	round?: boolean;
	style?: StyleProp<ViewStyle>;
};

export type CloseButtonProps = {
	onPress: () => void;
	size?: number;
	style?: StyleProp<ViewStyle>;
};

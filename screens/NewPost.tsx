import EditItemModal from '@/components/NewPost/EditItemModal';
import PostFormFields from '@/components/NewPost/PostFormFields';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { COMMUNITY_TYPES } from '@/constants/post';
import { auth } from '@/fbase';
import { useCreatePost } from '@/hooks/mutation/post/useCreatePost';
import { useUpdatePost } from '@/hooks/mutation/post/useUpdatePost';
import { usePostDetail } from '@/hooks/query/post/usePostDetail';
import useLoading from '@/hooks/shared/useLoading';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { usePostForm } from '@/hooks/shared/usePostForm';
import { usePostSubmit } from '@/hooks/shared/usePostSubmit';
import { useAuthStore } from '@/stores/AuthStore';
import { ImageType } from '@/types/image';
import { RootStackNavigation, type NewPostRouteProp } from '@/types/navigation';
import { CartItem, CommunityType, MarketType } from '@/types/post';
import { handleImageUpload } from '@/utilities/handleImageUpload';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import { validateInput } from '@/utilities/validateInput';
import {
	useFocusEffect,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import AddItemModal from '../components/NewPost/AddItemModal';
import Button from '../components/ui/Button';

const NewPost = () => {
	const { collectionName, isBoardPost, isCommunityPost } = usePostContext();

	const userInfo = useAuthStore((state) => state.userInfo);
	const route = useRoute<NewPostRouteProp>();
	const stackNavigation = useNavigation<RootStackNavigation>();

	const [editingId, setEditingId] = useState<string>(route.params?.id || '');
	const [isAddItemModalVisible, setIsAddItemModalVisible] =
		useState<boolean>(false);
	const [isEditItemModalVisible, setIsEditItemModalVisible] =
		useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const { data: post, isLoading } = usePostDetail<typeof collectionName>(
		collectionName,
		editingId,
	);

	const { mutate: createPost, isPending: isCreating } =
		useCreatePost(collectionName);
	const { mutate: updatePost, isPending: isUpdating } = useUpdatePost(
		collectionName,
		editingId,
	);

	const { isLoading: isSubmitting, setIsLoading: setIsSubmitting } =
		useLoading();

	const flatListRef = useRef<FlatList>(null);
	const { form, resetForm } = usePostForm(collectionName);

	const dropdownOptions = COMMUNITY_TYPES.map(({ KR, EN }) => ({
		text: KR,
		value: EN,
	}));

	const resetAll = () => {
		resetForm();
		setEditingId('');
	};

	const { createPostFlow, updatePostFlow } = usePostSubmit({
		collectionName,
		resetAll,
		createPost,
		updatePost,
	});

	const {
		type,
		setType,
		title,
		setTitle,
		body,
		setBody,
		images,
		setImages,
		cart,
		setCart,
		originalImageUrls,
		setOriginalImageUrls,
	} = form;

	useEffect(() => {
		if (route.params?.id) setEditingId(route.params.id);
	}, [route.params?.id]);

	useFocusEffect(
		useCallback(() => {
			if (route.params?.updatedCart) setCart(route.params.updatedCart);
		}, [route.params]),
	);

	useEffect(() => {
		if (!post) return;

		setType(post.type);
		setTitle(post.title);
		setBody(post.body);

		if (isBoardPost(post, collectionName)) {
			setCart(post.cart);
		}

		if (isCommunityPost(post, collectionName)) {
			setOriginalImageUrls(post.images);
			setImages(post.images.map((url) => ({ uri: url } as ImageType)));
		}
	}, [post, collectionName]);

	useEffect(() => {
		if (isSubmitting || isCreating || isUpdating) {
			stackNavigation.setOptions({ headerShown: false });
		}
	}, [isSubmitting, isCreating, isUpdating]);

	const validateUser = () => {
		if (!userInfo || !auth.currentUser) {
			showToast('warn', '글 쓰기는 로그인 후 가능합니다.');
			return false;
		}
		return true;
	};

	const validateForm = () => {
		setIsSubmitted(true);

		const titleError = validateInput('postTitle', title);
		const bodyError = validateInput('postBody', body);

		if (titleError || bodyError) {
			return false;
		}

		return true;
	};

	const onSubmit = async () => {
		setIsSubmitting(true);

		if (!validateUser()) {
			navigateToLogin();
			setIsSubmitting(false);
			return;
		}

		if (!validateForm()) {
			scrollToTop();
			setIsSubmitting(false);
			return;
		}

		try {
			// 결과적으로 사용할 이미지 URL 배열
			const imageUrls = await handleImageUpload({
				collectionName,
				images,
				originalImageUrls,
			});

			const formData =
				collectionName === 'Boards'
					? {
							type: type as MarketType,
							title,
							body,
							cart,
					  }
					: {
							type: type as CommunityType,
							title,
							body,
							images: images.map((image) => image.uri),
					  };

			if (editingId) {
				await updatePostFlow({
					imageUrls,
					form: formData,
				});
			} else {
				await createPostFlow({
					imageUrls,
					form: formData,
					userId: userInfo!.uid,
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const scrollToTop = () => {
		flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
	};

	const openAddItemModal = () => {
		setIsAddItemModalVisible(true);
	};

	const closeAddItemModal = () => {
		setIsAddItemModalVisible(false);
	};

	const openEditItemModal = () => {
		setIsEditItemModalVisible(true);
	};

	const closeEditItemModal = () => {
		setIsEditItemModalVisible(false);
	};

	const handleEditItemPress = (item: CartItem) => {
		setSelectedItem(item);
		openEditItemModal();
	};

	const updateItemFromCart = (updatedCartItem: CartItem) => {
		setCart((prevCart) =>
			prevCart.map((cartItem) =>
				cartItem.id === updatedCartItem.id ? updatedCartItem : cartItem,
			),
		);
	};

	const deleteItemFromCart = (deleteCartItemId: string) => {
		setCart(cart.filter((cartItem) => cartItem.id !== deleteCartItemId));
	};

	if (isSubmitting || isCreating || isUpdating || (editingId && isLoading)) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<Layout containerStyle={{ padding: PADDING }}>
				<KeyboardAvoidingView style={styles.screen}>
					<FlatList
						ref={flatListRef}
						data={[]}
						renderItem={null}
						ListEmptyComponent={
							<PostFormFields
								form={form}
								isSubmitted={isSubmitted}
								dropdownOptions={dropdownOptions}
								handleEditItemPress={handleEditItemPress}
								deleteItemFromCart={deleteItemFromCart}
							/>
						}
					/>
				</KeyboardAvoidingView>
				<View style={styles.buttonContainer}>
					{collectionName === 'Boards' && (
						<Button
							color='white'
							size='lg'
							style={{ flex: 1 }}
							onPress={openAddItemModal}
						>
							아이템 추가
						</Button>
					)}
					<Button
						color='mint'
						size='lg2'
						style={{ flex: 1 }}
						onPress={onSubmit}
					>
						등록
					</Button>
				</View>
			</Layout>

			{isAddItemModalVisible && (
				<AddItemModal
					cart={cart}
					setCart={setCart}
					isVisible={isAddItemModalVisible}
					onClose={closeAddItemModal}
				/>
			)}

			{isEditItemModalVisible && (
				<EditItemModal
					item={selectedItem}
					isVisible={isEditItemModalVisible}
					onUpdate={updateItemFromCart}
					onClose={closeEditItemModal}
				/>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	buttonContainer: {
		marginTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
});

export default NewPost;

import EditItemModal from '@/components/NewPost/EditItemModal';
import PostForm from '@/components/NewPost/PostForm';
import Button from '@/components/ui/Button';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { NewPostFormValues } from '@/hooks/post/form/newPostFormSchema';
import { useNewPostForm } from '@/hooks/post/form/useNewPostForm';
import { useCreatePost } from '@/hooks/post/mutation/useCreatePost';
import { useUpdatePost } from '@/hooks/post/mutation/useUpdatePost';
import { usePostDetail } from '@/hooks/post/query/usePostDetail';
import { usePostContext } from '@/hooks/post/usePostContext';
import { usePostSubmit } from '@/hooks/post/usePostSubmit';
import useLoading from '@/hooks/shared/useLoading';
import { useAuthStore } from '@/stores/AuthStore';
import { ImageType } from '@/types/image';
import { RootStackNavigation, type NewPostRouteProp } from '@/types/navigation';
import { CartItem, CommunityType, Item, MarketType } from '@/types/post';
import { handleImageUpload } from '@/utilities/handleImageUpload';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import AddItemModal from '../components/NewPost/AddItemModal';

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

	const flatListRef = useRef<any>(null);

	const methods = useNewPostForm(collectionName);
	const {
		getValues,
		setValue,
		watch,
		reset,
		handleSubmit,
		formState: { errors },
	} = methods;

	const resetAll = () => {
		reset();
		setEditingId('');
	};

	const { createPostFlow, updatePostFlow } = usePostSubmit({
		collectionName,
		resetAll,
		createPost,
		updatePost,
	});

	// 수정글 로딩 시 초기값 채우기
	useEffect(() => {
		if (route.params?.id) setEditingId(route.params.id);
	}, [route.params?.id]);

	useEffect(() => {
		if (!post) return;

		setValue('collectionName', collectionName);

		setValue('type', post.type);
		setValue('title', post.title);
		setValue('body', post.body);

		if (isBoardPost(post, collectionName)) {
			setValue('cart', post.cart);
		}

		if (isCommunityPost(post, collectionName)) {
			setValue('originalImageUrls', post.images);
			setValue(
				'images',
				post.images.map((url) => ({ uri: url } as ImageType)),
			);
		}
	}, [post, collectionName]);

	// 로딩 페이지에서 헤더 숨기기
	useEffect(() => {
		if (isSubmitting || isCreating || isUpdating) {
			stackNavigation.setOptions({ headerShown: false });
		}
	}, [isSubmitting, isCreating, isUpdating]);

	const onSubmit = async (formData: NewPostFormValues) => {
		setIsSubmitting(true);

		try {
			// 결과적으로 사용할 이미지 URL 배열
			const imageUrls: string[] = await handleImageUpload({
				collectionName,
				images: formData.images ?? [],
				originalImageUrls: formData.originalImageUrls ?? [],
			});

			const typedFormData =
				collectionName === 'Boards'
					? {
							type: formData.type as MarketType,
							title: formData.title,
							body: formData.body,
							cart: formData.cart ?? [],
					  }
					: {
							type: formData.type as CommunityType,
							title: formData.title,
							body: formData.body,
							images: imageUrls,
					  };

			if (editingId) {
				await updatePostFlow({
					imageUrls,
					form: typedFormData,
				});
			} else {
				await createPostFlow({
					imageUrls,
					form: typedFormData,
					userId: userInfo!.uid,
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const onError = (errors: any) => {
		console.log('🧨 Zod Errors', JSON.stringify(errors, null, 2));

		showToast('error', '게시글 작성 중 오류가 발생했습니다.');
		scrollToTop();
	};

	const scrollToTop = () => {
		flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
	};

	const openAddItemModal = useCallback(() => {
		setIsAddItemModalVisible(true);
	}, []);
	const closeAddItemModal = useCallback(
		() => setIsAddItemModalVisible(false),
		[],
	);
	const openEditItemModal = useCallback(
		() => setIsEditItemModalVisible(true),
		[],
	);
	const closeEditItemModal = useCallback(
		() => setIsEditItemModalVisible(false),
		[],
	);

	const addItemToCart = (item: Item) => {
		const cart = getValues('cart') ?? [];
		const isAlreadyAdded = cart.some((c) => c.id === item.id);

		if (isAlreadyAdded) {
			showToast('warn', '이미 추가된 아이템이에요.');
		} else {
			const newAddedItem: CartItem = {
				...item,
				quantity: 1,
				price: 1,
				unit: 'mileticket',
			};

			setValue('cart', [...cart, newAddedItem]);
			showToast('success', `${item.name}이(가) 추가되었어요.`);
		}
	};

	const handleEditItemPress = (item: CartItem) => {
		setSelectedItem(item);
		openEditItemModal();
	};

	const updateItemFromCart = (updatedCartItem: CartItem) => {
		const cart = getValues('cart') ?? [];
		setValue(
			'cart',
			cart.map((cartItem) =>
				cartItem.id === updatedCartItem.id ? updatedCartItem : cartItem,
			),
		);
	};

	const deleteItemFromCart = (deleteCartItemId: string) => {
		const cart = getValues('cart') ?? [];
		setValue(
			'cart',
			cart.filter((cartItem) => cartItem.id !== deleteCartItemId),
		);
	};

	if (isSubmitting || isCreating || isUpdating || (editingId && isLoading)) {
		return <LoadingIndicator />;
	}

	return (
		<FormProvider {...methods}>
			<Layout>
				<PostForm
					collectionName={collectionName}
					flatListRef={flatListRef}
					handleEditItemPress={handleEditItemPress}
					deleteItemFromCart={deleteItemFromCart}
				/>

				<View style={styles.buttonContainer}>
					{collectionName === 'Boards' && (
						<Button color='white' size='lg' flex onPress={openAddItemModal}>
							아이템 추가
						</Button>
					)}
					<Button
						color='mint'
						size='lg2'
						flex
						onPress={handleSubmit(onSubmit, onError)}
					>
						등록
					</Button>
				</View>
			</Layout>

			<AddItemModal
				cart={getValues('cart') ?? []}
				addItemToCart={addItemToCart}
				isVisible={isAddItemModalVisible}
				onClose={closeAddItemModal}
			/>

			<EditItemModal
				item={selectedItem}
				updateItemFromCart={updateItemFromCart}
				isVisible={isEditItemModalVisible}
				onClose={closeEditItemModal}
			/>
		</FormProvider>
	);
};

const styles = StyleSheet.create({
	buttonContainer: {
		padding: PADDING,
		marginTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
});

export default NewPost;

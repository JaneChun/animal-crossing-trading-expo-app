import EditItemModal from '@/components/NewPost/EditItemModal';
import PostForm from '@/components/NewPost/PostForm';
import Button from '@/components/ui/Button';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { auth } from '@/fbase';
import { NewPostFormValues } from '@/hooks/form/NewPost/newPostFormSchema';
import { useNewPostForm } from '@/hooks/form/NewPost/useNewPostForm';
import { useCreatePost } from '@/hooks/mutation/post/useCreatePost';
import { useUpdatePost } from '@/hooks/mutation/post/useUpdatePost';
import { usePostDetail } from '@/hooks/query/post/usePostDetail';
import useLoading from '@/hooks/shared/useLoading';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { usePostSubmit } from '@/hooks/shared/usePostSubmit';
import { useAuthStore } from '@/stores/AuthStore';
import { ImageType } from '@/types/image';
import { RootStackNavigation, type NewPostRouteProp } from '@/types/navigation';
import { CartItem, CommunityType, MarketType } from '@/types/post';
import { handleImageUpload } from '@/utilities/handleImageUpload';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import {
	useFocusEffect,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { SafeAreaView, StyleSheet, View } from 'react-native';
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

	useEffect(() => {
		stackNavigation.setOptions({
			headerRight: () => (
				<Button
					color='white'
					size='md2'
					onPress={handleSubmit(onSubmit, onError)}
				>
					등록
				</Button>
			),
		});
	}, []);

	// 수정글 로딩 시 초기값 채우기
	useEffect(() => {
		if (route.params?.id) setEditingId(route.params.id);
	}, [route.params?.id]);

	useEffect(() => {
		if (!post) return;

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

	// 아이템 모달 닫을 때 cart 업데이트
	useFocusEffect(
		useCallback(() => {
			if (route.params?.updatedCart) setValue('cart', route.params.updatedCart);
		}, [route.params]),
	);

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

	const onSubmit = async (formData: NewPostFormValues) => {
		setIsSubmitting(true);

		if (!validateUser()) {
			navigateToLogin();
			setIsSubmitting(false);
			return;
		}

		try {
			// 결과적으로 사용할 이미지 URL 배열
			const imageUrls = await handleImageUpload({
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
							images: (formData?.images ?? []).map(
								(image: ImageType) => image.uri,
							),
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

	const handleEditItemPress = (item: CartItem) => {
		setSelectedItem(item);
		openEditItemModal();
	};

	const updateItemFromCart = (updatedCartItem: CartItem) => {
		const cart = watch('cart') ?? [];
		setValue(
			'cart',
			cart.map((cartItem) =>
				cartItem.id === updatedCartItem.id ? updatedCartItem : cartItem,
			),
		);
	};

	const deleteItemFromCart = (deleteCartItemId: string) => {
		const cart = watch('cart') ?? [];
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
			<SafeAreaView style={styles.screen}>
				<Layout>
					<PostForm
						collectionName={collectionName}
						flatListRef={flatListRef}
						handleEditItemPress={handleEditItemPress}
						deleteItemFromCart={deleteItemFromCart}
					/>

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
							onPress={handleSubmit(onSubmit, onError)}
						>
							등록
						</Button>
					</View>
				</Layout>
			</SafeAreaView>

			{isAddItemModalVisible && (
				<AddItemModal
					cart={getValues('cart') ?? []}
					setCart={(cart) => setValue('cart', cart)}
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
		</FormProvider>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	buttonContainer: {
		paddingHorizontal: PADDING,
		marginTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
});

export default NewPost;

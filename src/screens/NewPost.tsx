import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AddItemModal from '@/components/NewPost/AddItemModal';
import AddVillagerModal from '@/components/NewPost/AddVillagerModal';
import EditItemModal from '@/components/NewPost/EditItemModal';
import PostForm from '@/components/NewPost/PostForm';
import Button from '@/components/ui/Button';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { MAX_VILLAGERS } from '@/constants/post';
import { NewPostFormValues } from '@/hooks/post/form/newPostFormSchema';
import { useNewPostForm } from '@/hooks/post/form/useNewPostForm';
import { useCreatePost } from '@/hooks/post/mutation/useCreatePost';
import { useUpdatePost } from '@/hooks/post/mutation/useUpdatePost';
import { usePostDetail } from '@/hooks/post/query/usePostDetail';
import { usePostSubmit } from '@/hooks/post/usePostSubmit';
import useLoading from '@/hooks/shared/useLoading';
import { useVillagers } from '@/hooks/villager/query/useVillagers';
import { useUserInfo } from '@/stores/auth';
import { ImageType } from '@/types/image';
import { RootStackNavigation, type NewPostRouteProp } from '@/types/navigation';
import { CartItem, CommunityType, Item, MarketType } from '@/types/post';
import { Villager } from '@/types/villager';
import { handleImageUpload } from '@/utilities/handleImageUpload';
import { isBoardPost, isCommunityPost } from '@/utilities/typeGuards/postTypeGuards';

const NewPost = () => {
	const route = useRoute<NewPostRouteProp>();
	const collectionName = route.params?.collectionName ?? 'Boards';

	const userInfo = useUserInfo();
	const stackNavigation = useNavigation<RootStackNavigation>();

	const insets = useSafeAreaInsets();
	const headerHeight = useHeaderHeight();

	const [editingId, setEditingId] = useState<string>(route.params?.id || '');

	const [isAddItemModalVisible, setIsAddItemModalVisible] = useState<boolean>(false);
	const [isEditItemModalVisible, setIsEditItemModalVisible] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

	const [isAddVillagerModalVisible, setIsAddVillagerModalVisible] = useState<boolean>(false);
	const [selectedVillagers, setSelectedVillagers] = useState<Villager[]>([]); // UI 표시용 주민 목록

	const { data: post, isLoading } = usePostDetail<typeof collectionName>(
		collectionName,
		editingId,
	);

	const isVillagerPostEdit =
		!!editingId &&
		collectionName === 'Communities' &&
		(post?.type === 'adopt' || post?.type === 'giveaway');

	const { data: allVillagers = [] } = useVillagers('All', '', {
		enabled: isVillagerPostEdit,
	});

	const { mutate: createPost, isPending: isCreating } = useCreatePost(collectionName);
	const { mutate: updatePost, isPending: isUpdating } = useUpdatePost(collectionName, editingId);

	const { isLoading: isSubmitting, setIsLoading: setIsSubmitting } = useLoading();

	const scrollViewRef = useRef<ScrollView | null>(null);

	const methods = useNewPostForm(collectionName);
	const {
		getValues,
		setValue,
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
				post.images.map((url): ImageType => ({ uri: url })),
			);
			if (post.type === 'adopt' || post.type === 'giveaway') {
				setValue('villagers', post.villagers);
			}
		}
	}, [post, collectionName, setValue]);

	useEffect(() => {
		if (!isVillagerPostEdit || allVillagers.length === 0) return;

		const existingVillagers = allVillagers.filter((v) => post.villagers?.includes(v.id));
		setSelectedVillagers(existingVillagers);
	}, [isVillagerPostEdit, allVillagers.length]);

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
							villagers: formData.villagers ?? [],
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

		scrollToTop();
	};

	const scrollToTop = () => {
		console.log('scrollToTop');
		scrollViewRef.current?.scrollTo(0);
	};

	// 아이템 관련 핸들러
	const openAddItemModal = useCallback(() => {
		setIsAddItemModalVisible(true);
	}, []);
	const closeAddItemModal = useCallback(() => setIsAddItemModalVisible(false), []);
	const openEditItemModal = useCallback(() => setIsEditItemModalVisible(true), []);
	const closeEditItemModal = useCallback(() => setIsEditItemModalVisible(false), []);

	const addItemToCart = useCallback(
		(item: Item) => {
			const cart = getValues('cart') ?? [];
			const isAlreadyAdded = cart.some((c) => c.id === item.id);

			if (isAlreadyAdded) {
				showToast('warn', '이미 추가된 아이템이에요.');
				return;
			}

			const newAddedItem: CartItem = {
				...item,
				quantity: 1,
				price: 1,
				unit: 'mileticket',
			};

			setValue('cart', [...cart, newAddedItem]);
			showToast('success', `${item.name}이(가) 추가되었어요.`);
		},
		[getValues, setValue],
	);

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

	// 주민 관련 핸들러
	const openAddVillagerModal = useCallback(() => setIsAddVillagerModalVisible(true), []);
	const closeAddVillagerModal = useCallback(() => setIsAddVillagerModalVisible(false), []);

	const addVillager = useCallback(
		(villager: Villager) => {
			const villagerIds = getValues('villagers') ?? [];
			const isAlreadyAdded = villagerIds.includes(villager.id);

			if (isAlreadyAdded) {
				showToast('warn', '이미 추가된 주민이에요.');
				return;
			}

			if (villagerIds.length >= MAX_VILLAGERS) {
				showToast('warn', `최대 ${MAX_VILLAGERS}명까지 추가할 수 있어요.`);
				return;
			}

			// Form에는 id만 저장
			setValue('villagers', [...villagerIds, villager.id]);
			// UI 표시용으로 전체 객체 저장
			setSelectedVillagers((prev) => [...prev, villager]);
			showToast('success', `${villager.name}이(가) 추가되었어요.`);
		},
		[getValues, setValue],
	);

	const deleteVillager = useCallback(
		(villagerId: string) => {
			const villagerIds = getValues('villagers') ?? [];
			// Form에서 id 제거
			setValue(
				'villagers',
				villagerIds.filter((id) => id !== villagerId),
			);
			// UI 표시용 목록에서도 제거
			setSelectedVillagers((prev) => prev.filter((v) => v.id !== villagerId));
		},
		[getValues, setValue],
	);

	if (isSubmitting || isCreating || isUpdating || (editingId && isLoading)) {
		return <LoadingIndicator />;
	}

	return (
		<FormProvider {...methods}>
			<Layout>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={{ flex: 1 }}
					keyboardVerticalOffset={headerHeight + insets.top}
				>
					<PostForm
						collectionName={collectionName}
						scrollViewRef={scrollViewRef}
						handleEditItemPress={handleEditItemPress}
						deleteItemFromCart={deleteItemFromCart}
						deleteVillager={deleteVillager}
						openAddVillagerModal={openAddVillagerModal}
						selectedVillagers={selectedVillagers}
					/>
				</KeyboardAvoidingView>

				<View style={styles.buttonContainer}>
					{collectionName === 'Boards' && (
						<Button
							color="white"
							size="lg"
							flex
							onPress={openAddItemModal}
							testID="addItemButton"
						>
							아이템 추가
						</Button>
					)}
					<Button
						color="mint"
						size="lg2"
						flex
						disabled={Object.keys(errors).length > 0}
						onPress={handleSubmit(onSubmit, onError)}
						testID="submitPostButton"
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

			<AddVillagerModal
				addVillager={addVillager}
				isVisible={isAddVillagerModalVisible}
				onClose={closeAddVillagerModal}
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

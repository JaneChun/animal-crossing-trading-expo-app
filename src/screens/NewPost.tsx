import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors, FormProvider } from 'react-hook-form';
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
import { NewPostFormValues } from '@/hooks/post/form/newPostFormSchema';
import { useCartState } from '@/hooks/post/form/useCartState';
import { useNewPostForm } from '@/hooks/post/form/useNewPostForm';
import { useVillagerState } from '@/hooks/post/form/useVillagerState';
import { useCreatePost } from '@/hooks/post/mutation/useCreatePost';
import { useUpdatePost } from '@/hooks/post/mutation/useUpdatePost';
import { usePostDetail } from '@/hooks/post/query/usePostDetail';
import { usePostSubmit } from '@/hooks/post/usePostSubmit';
import useLoading from '@/hooks/shared/useLoading';
import { useUserInfo } from '@/stores/auth';
import { ImageType } from '@/types/image';
import { RootStackNavigation, type NewPostRouteProp } from '@/types/navigation';
import { CommunityType, MarketType } from '@/types/post';
import { handleImageUpload } from '@/utilities/handleImageUpload';
import { isBoardPost, isCommunityPost } from '@/utilities/typeGuards/postTypeGuards';

const NewPost = () => {
	// ─────────────────────────────────────────────────────────────
	// Navigation & Layout
	// ─────────────────────────────────────────────────────────────
	const stackNavigation = useNavigation<RootStackNavigation>();
	const route = useRoute<NewPostRouteProp>();
	const collectionName = route.params?.collectionName ?? 'Boards';
	const insets = useSafeAreaInsets();
	const headerHeight = useHeaderHeight();

	// ─────────────────────────────────────────────────────────────
	// Auth
	// ─────────────────────────────────────────────────────────────
	const userInfo = useUserInfo();

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────
	const [editingId, setEditingId] = useState<string>(route.params?.id || '');
	const scrollViewRef = useRef<ScrollView | null>(null);

	// ─────────────────────────────────────────────────────────────
	// Data Query
	// ─────────────────────────────────────────────────────────────
	const { data: post, isLoading } = usePostDetail<typeof collectionName>(
		collectionName,
		editingId,
	);

	// ─────────────────────────────────────────────────────────────
	// Form & State Management
	// ─────────────────────────────────────────────────────────────
	const methods = useNewPostForm(collectionName);
	const {
		getValues,
		setValue,
		reset,
		handleSubmit,
		formState: { errors },
	} = methods;

	const existingVillagerIds = useMemo(() => {
		if (!post) return [];
		if (post.type !== 'adopt' && post.type !== 'giveaway') return [];

		return post.villagers ?? [];
	}, [post]);

	const cartState = useCartState(getValues, setValue);
	const villagerState = useVillagerState(getValues, setValue, existingVillagerIds);

	// ─────────────────────────────────────────────────────────────
	// Mutations & Submit
	// ─────────────────────────────────────────────────────────────
	const { mutate: createPost, isPending: isCreating } = useCreatePost(collectionName);
	const { mutate: updatePost, isPending: isUpdating } = useUpdatePost(collectionName, editingId);
	const { isLoading: isSubmitting, setIsLoading: setIsSubmitting } = useLoading();

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

	// ─────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────
	// 수정글 로딩 시 editingId 설정
	useEffect(() => {
		if (route.params?.id) setEditingId(route.params.id);
	}, [route.params?.id]);

	// 수정글 데이터로 폼 초기화
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
			setValue('villagers', post.villagers);
		}
	}, [post, collectionName, setValue]);

	// 제출(로딩) 중 헤더 숨기기
	useEffect(() => {
		if (isSubmitting || isCreating || isUpdating) {
			stackNavigation.setOptions({ headerShown: false });
		}
	}, [isSubmitting, isCreating, isUpdating]);

	// ─────────────────────────────────────────────────────────────
	// Handlers
	// ─────────────────────────────────────────────────────────────
	const onSubmit = async (formData: NewPostFormValues) => {
		setIsSubmitting(true);

		try {
			// 결과적으로 사용할 이미지 URL 배열
			const imageUrls: string[] = await handleImageUpload({
				collectionName,
				images: (formData.images ?? []) as ImagePickerAsset[],
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
		} catch {
			// 이미지 업로드 에러: handleImageUpload는 순수 async 함수이므로 try-catch로 에러를 잡고, 내부에서 toast 처리 후 rethrow하여 여기로 전파됨.
			// 게시글 작성/수정 에러: mutate()는 에러를 throw하지 않으므로 이 catch에 도달하지 않음. createPostFlow, updatePostFlow의 onError 콜백에서 처리됨.
		} finally {
			setIsSubmitting(false);
		}
	};

	const onError = (errors: FieldErrors<NewPostFormValues>) => {
		console.log('🧨 Zod Errors', JSON.stringify(errors, null, 2));
		scrollToTop();
	};

	const scrollToTop = () => {
		console.log('scrollToTop');
		scrollViewRef.current?.scrollTo(0);
	};

	// ─────────────────────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────────────────────
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
						handleEditItemPress={cartState.openEditModal}
						deleteItemFromCart={cartState.deleteItem}
						deleteVillager={villagerState.deleteVillager}
						openAddVillagerModal={villagerState.openModal}
						selectedVillagers={villagerState.selectedVillagers}
					/>
				</KeyboardAvoidingView>

				<View style={styles.buttonContainer}>
					{collectionName === 'Boards' && (
						<Button
							color="white"
							size="lg"
							flex
							onPress={cartState.openAddModal}
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
				addItemToCart={cartState.addItem}
				isVisible={cartState.isAddModalVisible}
				onClose={cartState.closeAddModal}
			/>

			<EditItemModal
				item={cartState.selectedItem}
				updateItemFromCart={cartState.updateItem}
				isVisible={cartState.isEditModalVisible}
				onClose={cartState.closeEditModal}
			/>

			<AddVillagerModal
				addVillager={villagerState.addVillager}
				isVisible={villagerState.isModalVisible}
				onClose={villagerState.closeModal}
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

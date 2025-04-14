import BodyInput from '@/components/NewPost/BodyInput';
import ImageInput from '@/components/NewPost/ImageInput';
import TitleInput from '@/components/NewPost/TitleInput';
import TypeSelect from '@/components/NewPost/TypeSelect';
import DropdownInput from '@/components/ui/DropdownInput';
import Layout, { PADDING } from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { auth } from '@/fbase';
import {
	deleteObjectFromStorage,
	uploadObjectToStorage,
} from '@/firebase/services/imageService';
import { useCreatePost } from '@/hooks/mutation/post/useCreatePost';
import { useUpdatePost } from '@/hooks/mutation/post/useUpdatePost';
import { usePostDetail } from '@/hooks/query/post/usePostDetail';
import useLoading from '@/hooks/shared/useLoading';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { type NewPostRouteProp, type TabNavigation } from '@/types/navigation';
import {
	CartItem,
	CreatePostRequest,
	Type,
	UpdatePostRequest,
} from '@/types/post';
import { validateInput } from '@/utilities/validateInput';
import {
	useFocusEffect,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import AddItemModal from '../components/NewPost/AddItemModal';
import ItemList from '../components/NewPost/ItemList';
import Button from '../components/ui/Button';
import { categories } from './Community';

const NewPost = () => {
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const isMarket = activeTab === 'Home' || activeTab === 'Profile';
	const isCommunity = activeTab === 'Community';
	const collectionName = isMarket ? 'Boards' : 'Communities';
	const tabNavigation = useNavigation<TabNavigation>();
	const stackNavigation = useNavigation<any>();
	const userInfo = useAuthStore((state) => state.userInfo);
	const route = useRoute<NewPostRouteProp>();
	const [editingId, setEditingId] = useState<string>(route.params?.id || '');
	const { data: post, isLoading } = usePostDetail(collectionName, editingId);
	const { mutate: createPost, isPending: isCreating } =
		useCreatePost(collectionName);
	const { mutate: updatePost, isPending: isUpdating } = useUpdatePost(
		collectionName,
		editingId,
	);
	const {
		isLoading: isSubmitting,
		setIsLoading: setIsSubmitting,
		LoadingIndicator,
	} = useLoading();
	const [isModalVisible, setModalVisible] = useState<boolean>(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const flatListRef = useRef<FlatList>(null);
	const [type, setType] = useState<Type>(isMarket ? 'buy' : 'general');
	const [title, setTitle] = useState<string>('');
	const [body, setBody] = useState<string>('');
	const [images, setImages] = useState<ImagePickerAsset[]>([]); // ImagePicker로 추가한 이미지
	const [cart, setCart] = useState<CartItem[]>([]);
	const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]); // Firestore에서 가져온 기존 이미지

	const dropdownOptions = categories
		.map(({ KR, EN }) => ({
			text: KR,
			value: EN,
		}))
		.filter(({ value }) => value !== 'all');

	useEffect(() => {
		if (route.params?.id) {
			setEditingId(route.params.id);
		}
	}, [route.params?.id]);

	useFocusEffect(
		useCallback(() => {
			if (route.params?.updatedCart) {
				setCart(route.params.updatedCart);
			}
		}, [route.params]),
	);

	useEffect(() => {
		if (!post) return;

		setType(post.type);
		setTitle(post.title);
		setBody(post.body);
		if (post.cart) setCart(post.cart);

		if (post.images?.length) {
			setOriginalImageUrls(post.images);
			setImages(
				post.images.map((url: string) => ({ uri: url } as ImagePickerAsset)),
			); // UI 표시에 필요하므로 images에도 변환하여 추가
		}
	}, [post]);

	const validateUser = () => {
		if (!userInfo || !auth.currentUser) {
			showToast('warn', '글 쓰기는 로그인 후 가능합니다.');
			return false;
		}
		return true;
	};

	const validateForm = () => {
		const titleError = validateInput('postTitle', title);
		const bodyError = validateInput('postBody', body);

		if (titleError || bodyError) {
			return false;
		}

		return true;
	};

	const resetForm = () => {
		setType('buy');
		setTitle('');
		setBody('');
		setImages([]);
		setCart([]);
		setOriginalImageUrls([]);
		setEditingId('');
	};

	// images와 originalImageUrls를 비교하여 기존 이미지, 새로 추가된 이미지, 삭제된 이미지 구분
	const getFilteredImages = () => {
		const newImages: ImagePickerAsset[] = images.filter(
			({ uri }) => !originalImageUrls.includes(uri),
		);

		const deletedImageUrls: string[] = originalImageUrls.filter(
			(url) => !images.some(({ uri }) => uri === url),
		);
		return { newImages, deletedImageUrls };
	};

	const buildCreatePostRequest = (imageUrls: string[]): CreatePostRequest => {
		const baseRequest = {
			type,
			title: title.trim(),
			body: body.trim(),
			creatorId: userInfo!.uid,
		};

		if (isMarket) {
			return {
				...baseRequest,
				cart,
			};
		} else if (isCommunity) {
			return {
				...baseRequest,
				images: imageUrls,
			};
		}

		throw new Error(`Invalid activeTab: ${activeTab}`);
	};

	const buildUpdatePostRequest = (imageUrls: string[]): UpdatePostRequest => {
		const baseRequest = {
			type,
			title: title.trim(),
			body: body.trim(),
		};

		if (isMarket) {
			return {
				...baseRequest,
				cart,
			};
		} else if (isCommunity) {
			return {
				...baseRequest,
				images: imageUrls,
			};
		}

		throw new Error(`Invalid activeTab: ${activeTab}`);
	};

	const createPostFlow = async (imageUrls: string[]) => {
		const requestData = buildCreatePostRequest(imageUrls);

		createPost(requestData, {
			onSuccess: (id) => {
				resetForm();
				stackNavigation.popTo('PostDetail', { id });
				showToast('success', '게시글이 작성되었습니다.');
			},
			onError: (e) => {
				showToast('error', '게시글 작성 중 오류가 발생했습니다.');
			},
		});
	};

	const updatePostFlow = async (imageUrls: string[]) => {
		const requestData = buildUpdatePostRequest(imageUrls);

		updatePost(requestData, {
			onSuccess: () => {
				resetForm();
				stackNavigation.goBack();
				showToast('success', '게시글이 수정되었습니다.');
			},
			onError: (e) => {
				showToast('error', '게시글 수정 중 오류가 발생했습니다.');
			},
		});
	};

	const handleImageUpload = async (): Promise<string[]> => {
		const { newImages, deletedImageUrls } = getFilteredImages();

		let uploadedImageUrls: string[] = [];

		// 새로운 이미지 처리: 스토리지에 업로드
		if (newImages.length) {
			uploadedImageUrls = await uploadObjectToStorage({
				directory: collectionName,
				images: newImages,
			});
		}

		// 삭제된 이미지 처리: 스토리지에서 삭제
		if (deletedImageUrls.length) {
			await Promise.all(deletedImageUrls.map(deleteObjectFromStorage));
		}

		// 최종적으로 DB에 저장할 imageUrls: 기존 이미지 + 새 이미지 - 삭제된 이미지
		const imageUrls = [...originalImageUrls, ...uploadedImageUrls].filter(
			(url) => !deletedImageUrls.includes(url),
		);

		return imageUrls;
	};

	const onSubmit = async () => {
		setIsSubmitted(true);
		setIsSubmitting(true);

		if (!validateUser()) {
			tabNavigation.navigate('ProfileTab', { screen: 'Login' });
			setIsSubmitting(false);
			return;
		}

		if (!validateForm()) {
			// 유효성 검사 실패 시 위로 스크롤 이동
			flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
			setIsSubmitting(false);
			return;
		}

		try {
			const imageUrls = await handleImageUpload();

			if (editingId) {
				await updatePostFlow(imageUrls);
			} else {
				await createPostFlow(imageUrls);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const openAddItemModal = () => {
		setModalVisible(true);
	};

	const closeAddItemModal = () => {
		setModalVisible(false);
	};

	if (isSubmitting || isCreating || isUpdating || (editingId && isLoading)) {
		return <LoadingIndicator />;
	}

	return (
		<Layout containerStyle={{ padding: PADDING }}>
			<KeyboardAvoidingView style={styles.screen}>
				<FlatList
					ref={flatListRef}
					data={[]}
					renderItem={null}
					ListEmptyComponent={
						<>
							{isMarket && <TypeSelect type={type} setType={setType} />}
							{isCommunity && (
								<View
									style={{
										width: '30%',
										flexDirection: 'row',
										marginBottom: 16,
									}}
								>
									<DropdownInput
										options={dropdownOptions}
										value={type}
										setValue={setType as any}
									/>
								</View>
							)}

							<TitleInput
								title={title}
								setTitle={setTitle}
								containerStyle={styles.inputContainer}
								labelStyle={styles.label}
								inputStyle={styles.input}
								isSubmitted={isSubmitted}
							/>

							<BodyInput
								body={body}
								setBody={setBody}
								containerStyle={styles.inputContainer}
								labelStyle={styles.label}
								inputStyle={styles.input}
								isSubmitted={isSubmitted}
							/>

							{isCommunity && (
								<ImageInput
									images={images}
									setImages={setImages}
									containerStyle={styles.inputContainer}
									labelStyle={styles.label}
								/>
							)}

							{isMarket && (
								<ItemList
									cart={cart}
									setCart={setCart}
									containerStyle={styles.inputContainer}
									labelStyle={styles.label}
								/>
							)}
						</>
					}
				/>
			</KeyboardAvoidingView>
			<View style={styles.buttonContainer}>
				{isMarket && (
					<Button
						color='white'
						size='lg'
						style={{ flex: 1 }}
						onPress={openAddItemModal}
					>
						아이템 추가
					</Button>
				)}
				<Button color='mint' size='lg' style={{ flex: 1 }} onPress={onSubmit}>
					등록
				</Button>
			</View>

			{isModalVisible && (
				<AddItemModal
					cart={cart}
					setCart={setCart}
					isVisible={isModalVisible}
					onClose={closeAddItemModal}
				/>
			)}
		</Layout>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	inputContainer: {
		marginVertical: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: 600,
		marginBottom: 12,
		color: Colors.font_black,
	},
	input: {
		fontSize: 16,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 8,
		backgroundColor: Colors.base,
	},
	buttonContainer: {
		marginTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
});

export default NewPost;

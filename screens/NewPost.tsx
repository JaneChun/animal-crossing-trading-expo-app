import { Colors } from '@/constants/Color';
import { auth } from '@/fbase';
import {
	deleteObjectFromStorage,
	uploadObjectToStorage,
} from '@/firebase/services/imageService';
import { type NewPostRouteProp, type TabNavigation } from '@/types/navigation';
import {
	useFocusEffect,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import { Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useAuthContext } from '../contexts/AuthContext';

import BodyInput from '@/components/NewPost/BodyInput';
import ImageInput from '@/components/NewPost/ImageInput';
import TitleInput from '@/components/NewPost/TitleInput';
import TypeSelect from '@/components/NewPost/TypeSelect';
import DropdownInput from '@/components/ui/DropdownInput';
import Layout from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { createPost, updatePost } from '@/firebase/services/postService';
import useGetPostDetail from '@/hooks/useGetPostDetail';
import useLoading from '@/hooks/useLoading';
import { useNavigationStore } from '@/store/store';
import {
	CartItem,
	CreatePostRequest,
	Type,
	UpdatePostRequest,
} from '@/types/post';
import { validateInput } from '@/utilities/validateInput';
import React from 'react';
import AddItemModal from '../components/NewPost/AddItemModal';
import ItemList from '../components/NewPost/ItemList';
import Button from '../components/ui/Button';
import { categories } from './Community';

const NewPost = () => {
	const { activeTab } = useNavigationStore();
	const isMarket = activeTab === 'Home' || activeTab === 'Profile';
	const isCommunity = activeTab === 'Community';
	const collectionName = isMarket ? 'Boards' : 'Communities';
	const tabNavigation = useNavigation<TabNavigation>();
	const stackNavigation = useNavigation<any>();
	const { userInfo } = useAuthContext();
	const {
		isLoading: isUploading,
		setIsLoading: setIsUploading,
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

	const route = useRoute<NewPostRouteProp>();
	const [editingId, setEditingId] = useState<string>(route.params?.id || '');

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

	const { post, isLoading: isFetching } = useGetPostDetail(
		collectionName,
		editingId,
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
			createdAt: Timestamp.now(),
			commentCount: 0,
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

	const onSubmit = async () => {
		setIsSubmitted(true);

		if (!validateUser()) {
			return tabNavigation.navigate('ProfileTab', { screen: 'Login' });
		}

		if (!validateForm()) {
			// 유효성 검사 실패 시 위로 스크롤 이동
			flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
			return;
		}

		const { newImages, deletedImageUrls } = getFilteredImages();

		let createdId;
		try {
			setIsUploading(true);
			let uploadedImageUrls: string[] = [];

			// 새 이미지가 있으면 스토리지에 업로드
			if (newImages.length) {
				uploadedImageUrls = await uploadObjectToStorage({
					directory: collectionName,
					images: newImages,
				});
			}

			// 기존 이미지 + 새 이미지 - 삭제된 이미지
			const imageUrls = [...originalImageUrls, ...uploadedImageUrls].filter(
				(url) => !deletedImageUrls.includes(url),
			);

			if (editingId) {
				const requestData = buildUpdatePostRequest(imageUrls);
				await updatePost(collectionName, editingId, requestData);

				// 삭제된 이미지가 있으면 스토리지에서도 삭제
				if (deletedImageUrls.length) {
					await Promise.all(deletedImageUrls.map(deleteObjectFromStorage));
				}

				stackNavigation.goBack();
				showToast('success', '글이 수정되었습니다.');
			} else {
				const requestData = buildCreatePostRequest(imageUrls);
				createdId = await createPost(collectionName, requestData);

				stackNavigation.popTo('PostDetail', { id: createdId });
				showToast('success', '글이 작성되었습니다.');
			}

			resetForm();
		} finally {
			setIsUploading(false);
		}
	};

	const openAddItemModal = () => {
		setModalVisible(true);
	};

	const closeAddItemModal = () => {
		setModalVisible(false);
	};

	if (isUploading || (editingId && isFetching)) {
		return <LoadingIndicator />;
	}

	return (
		<Layout>
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

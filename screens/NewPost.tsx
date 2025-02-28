import { Colors } from '@/constants/Color';
import { auth } from '@/fbase';
import {
	deleteObjectFromStorage,
	uploadObjectToStorage,
} from '@/firebase/services/imageService';
import {
	HomeStackNavigation,
	NewPostNavigation,
	type NewPostRouteProp,
	type TabNavigation,
} from '@/types/navigation';
import {
	useFocusEffect,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import { Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useAuthContext } from '../contexts/AuthContext';

import BodyInput from '@/components/NewPost/BodyInput';
import ImageInput from '@/components/NewPost/ImageInput';
import TitleInput from '@/components/NewPost/TitleInput';
import TypeSelect from '@/components/NewPost/TypeSelect';
import Layout from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { createPost, updatePost } from '@/firebase/services/postService';
import useGetPostDetail from '@/hooks/useGetPostDetail';
import useLoading from '@/hooks/useLoading';
import {
	CartItem,
	CreatePostRequest,
	Type,
	UpdatePostRequest,
} from '@/types/post';
import React from 'react';
import ItemList from '../components/NewPost/ItemList';
import Button from '../components/ui/Button';

const NewPost = () => {
	const tabNavigation = useNavigation<TabNavigation>();
	const stackNavigation = useNavigation<HomeStackNavigation>();
	const newPostStackNavigation = useNavigation<NewPostNavigation>();
	const { userInfo } = useAuthContext();
	const { isLoading, setIsLoading, LoadingIndicator } = useLoading();

	const [type, setType] = useState<Type>('buy');
	const [title, setTitle] = useState<string>('');
	const [body, setBody] = useState<string>('');
	const [images, setImages] = useState<ImagePickerAsset[]>([]); // ImagePicker로 추가한 이미지
	const [cart, setCart] = useState<CartItem[]>([]);
	const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]); // Firestore에서 가져온 기존 이미지

	const route = useRoute<NewPostRouteProp>();
	const { id: editingId = '' } = route?.params ?? {};

	useFocusEffect(
		useCallback(() => {
			if (route.params?.updatedCart) {
				setCart(route.params.updatedCart);
			}
		}, [route.params]),
	);

	const { post, isLoading: loading } = useGetPostDetail(editingId);

	// useEffect(() => {
	// 	stackNavigation.setOptions({
	// 		headerRight: () => (
	// 			<Button color='white' size='md2' onPress={onSubmit}>
	// 				등록
	// 			</Button>
	// 		),
	// 	});
	// }, [title, body, images, cart]);

	useEffect(() => {
		if (!post) return;

		setType(post.type);
		setTitle(post.title);
		setBody(post.body);
		setCart(post.cart);

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
		if (!title || !body) {
			showToast('warn', '제목이나 내용이 비어있는지 확인해주세요.');
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
		return {
			type,
			title,
			body,
			images: imageUrls,
			cart,
			creatorId: userInfo!.uid,
			createdAt: Timestamp.now(),
			commentCount: 0,
		};
	};

	const buildUpdatePostRequest = (imageUrls: string[]): UpdatePostRequest => {
		return {
			type,
			title,
			body,
			images: imageUrls,
			cart,
		};
	};

	const onSubmit = async () => {
		if (!validateUser()) {
			return tabNavigation.navigate('ProfileTab', { screen: 'Login' });
		}

		if (!validateForm()) return;

		const { newImages, deletedImageUrls } = getFilteredImages();

		let createdId;
		try {
			setIsLoading(true);
			let uploadedImageUrls: string[] = [];

			// 새 이미지가 있으면 스토리지에 업로드
			if (newImages.length) {
				uploadedImageUrls = await uploadObjectToStorage({
					directory: 'Boards',
					images: newImages,
				});
			}

			// 기존 이미지 + 새 이미지 - 삭제된 이미지
			const imageUrls = [...originalImageUrls, ...uploadedImageUrls].filter(
				(url) => !deletedImageUrls.includes(url),
			);

			if (editingId) {
				const requestData = buildUpdatePostRequest(imageUrls);
				await updatePost(editingId, requestData);

				// 삭제된 이미지가 있으면 스토리지에서도 삭제
				if (deletedImageUrls.length) {
					await Promise.all(deletedImageUrls.map(deleteObjectFromStorage));
				}

				stackNavigation.goBack();
				showToast('success', '글이 수정되었습니다.');
			} else {
				const requestData = buildCreatePostRequest(imageUrls);
				createdId = await createPost(requestData);

				tabNavigation.navigate('HomeTab', {
					screen: 'PostDetail',
					params: {
						id: createdId,
					},
				});
				showToast('success', '글이 작성되었습니다.');
			}

			resetForm();
		} finally {
			setIsLoading(false);
		}
	};

	const openAddItem = () => {
		newPostStackNavigation.navigate('AddItem', { cart });
		// AddItem.tsx로 아래 props를 navigate할 떄 전달할 수 있나?
		// cart={cart}
		// setCart={setCart}
		// containerStyle={styles.inputContainer}
		// labelStyle={styles.label}
	};

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<Layout>
			<KeyboardAvoidingView style={styles.screen}>
				<FlatList
					data={[]}
					renderItem={null}
					ListEmptyComponent={
						<>
							<TypeSelect type={type} setType={setType} />

							<TitleInput
								title={title}
								setTitle={setTitle}
								containerStyle={styles.inputContainer}
								labelStyle={styles.label}
								inputStyle={styles.input}
							/>

							<BodyInput
								body={body}
								setBody={setBody}
								containerStyle={styles.inputContainer}
								labelStyle={styles.label}
								inputStyle={styles.input}
							/>

							<ImageInput
								images={images}
								setImages={setImages}
								containerStyle={styles.inputContainer}
								labelStyle={styles.label}
							/>

							<ItemList
								cart={cart}
								setCart={setCart}
								containerStyle={styles.inputContainer}
								labelStyle={styles.label}
							/>
						</>
					}
				/>
			</KeyboardAvoidingView>
			<View style={styles.buttonContainer}>
				<Button
					color='white'
					size='lg'
					style={{ flex: 1 }}
					onPress={openAddItem}
				>
					아이템 추가
				</Button>
				<Button color='mint' size='lg' style={{ flex: 1 }} onPress={onSubmit}>
					등록
				</Button>
			</View>
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

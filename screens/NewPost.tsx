import { Colors } from '@/constants/Color';
import {
	HomeStackNavigation,
	type NewPostRouteProp,
	type TabNavigation,
} from '@/types/navigation';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useAuthContext } from '../contexts/AuthContext';
import { auth } from '../fbase';
import {
	addDocToFirestore,
	deleteObjectFromStorage,
	updateDocToFirestore,
	uploadObjectToStorage,
} from '../firebase/firebaseApi';

import BodyInput from '@/components/NewPost/BodyInput';
import ImageInput from '@/components/NewPost/ImageInput';
import TitleInput from '@/components/NewPost/TitleInput';
import TypeSelect from '@/components/NewPost/TypeSelect';
import Layout from '@/components/ui/Layout';
import useGetPostDetail from '@/hooks/useGetPostDetail';
import useLoading from '@/hooks/useLoading';
import React from 'react';
import ItemList from '../components/NewPost/ItemList';
import ItemSelect from '../components/NewPost/ItemSelect';
import Button from '../components/ui/Button';

export type CartItem = {
	UniqueEntryID: string;
	color: string;
	imageUrl: string;
	name: string;
	quantity: number;
	price: number;
};

const NewPost = () => {
	const tabNavigation = useNavigation<TabNavigation>();
	const stackNavigation = useNavigation<HomeStackNavigation>();
	const { userInfo } = useAuthContext();
	const { isLoading, setIsLoading, LoadingIndicator } = useLoading();

	const [type, setType] = useState<'buy' | 'sell' | 'done'>('buy');
	const [title, setTitle] = useState<string>('');
	const [body, setBody] = useState<string>('');
	const [images, setImages] = useState<ImagePickerAsset[]>([]); // ImagePicker로 추가한 이미지
	const [cart, setCart] = useState<CartItem[]>([]);
	const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]); // Firestore에서 가져온 기존 이미지

	const route = useRoute<NewPostRouteProp>();
	const { id: editingId = '' } = route?.params ?? {};

	const { post, error, isLoading: loading } = useGetPostDetail(editingId);

	useEffect(() => {
		stackNavigation.setOptions({
			headerRight: () => (
				<Button color='white' size='md2' onPress={onSubmit}>
					등록
				</Button>
			),
		});
	}, [title, body, images, cart]);

	useEffect(() => {
		if (post) {
			setType(post.type || 'buy');
			setTitle(post.title || '');
			setBody(post.body || '');
			setCart(post.cart || []);

			if (post.images?.length) {
				setOriginalImageUrls(post.images);
				setImages(
					post.images.map((url: string) => ({ uri: url } as ImagePickerAsset)),
				); // UI 표시에 필요하므로 images에도 변환하여 추가
			}
		}
	}, [post]);

	const validateUser = () => {
		if (!userInfo || !auth.currentUser) {
			Alert.alert('글 쓰기는 로그인 후 가능합니다.');
			return false;
		}
		return true;
	};

	const validateForm = () => {
		if (!title || !body) {
			Alert.alert('오류', '제목이나 내용이 비어있는지 확인해주세요.');
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

	const onSubmit = async () => {
		if (!validateUser()) {
			return tabNavigation.navigate('Profile', { screen: 'Login' });
		}

		if (!validateForm()) return;

		// 기존 이미지, 새로 추가된 이미지, 삭제된 이미지 구분
		const newImages: ImagePickerAsset[] = images.filter(
			({ uri }) => !originalImageUrls.includes(uri),
		);
		const deletedImageUrls: string[] = originalImageUrls.filter(
			(url) => !images.some(({ uri }) => uri === url),
		);

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

			let requestData: {
				type: string;
				title: string;
				body: string;
				images: string[];
				cart: CartItem[];
				createdAt: Timestamp;
				creatorId?: string;
				commentCount: number;
			} = {
				type,
				title,
				body,
				images: [...originalImageUrls, ...uploadedImageUrls].filter(
					(url) => !deletedImageUrls.includes(url), // 기존 이미지 + 새 이미지 - 삭제된 이미지
				),
				cart,
				creatorId: userInfo?.uid,
				createdAt: Timestamp.now(),
				commentCount: 0,
			};

			if (editingId) {
				await updateDocToFirestore({
					collection: 'Boards',
					id: editingId,
					requestData,
				});

				// 삭제된 이미지가 있으면 스토리지에서도 삭제
				if (deletedImageUrls.length) {
					await Promise.all(deletedImageUrls.map(deleteObjectFromStorage));
				}
			} else {
				createdId = await addDocToFirestore({
					directory: 'Boards',
					requestData,
				});

				Alert.alert(
					`${editingId ? '수정' : '작성'} 완료`,
					`글이 ${editingId ? '수정' : '작성'}되었습니다.`,
				);
			}
		} catch (error) {
			Alert.alert(
				'오류',
				`글을 ${editingId ? '수정' : '작성'}하는 중 오류가 발생했습니다.`,
			);
			console.log(error);
		} finally {
			resetForm();
			setIsLoading(false);

			if (editingId) {
				stackNavigation.goBack();
			}

			if (createdId) {
				tabNavigation.navigate('Home', {
					screen: 'PostDetail',
					params: {
						id: createdId,
					},
				});
			}
		}
	};

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<Layout>
			<KeyboardAvoidingView>
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

							<ItemSelect
								cart={cart}
								setCart={setCart}
								containerStyle={styles.inputContainer}
								labelStyle={styles.label}
							/>

							<ItemList cart={cart} setCart={setCart} />

							<View style={styles.buttonContainer}>
								<Button color='white' size='lg' onPress={onSubmit}>
									등록
								</Button>
							</View>
						</>
					}
				></FlatList>
			</KeyboardAvoidingView>
		</Layout>
	);
};

const styles = StyleSheet.create({
	inputContainer: {
		marginVertical: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: 'semibold',
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
		flex: 1,
		justifyContent: 'flex-end',
	},
});

export default NewPost;

import { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
	FlatList,
	Alert,
	KeyboardAvoidingView,
	ScrollView,
	Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
	launchImageLibraryAsync,
	ImagePickerAsset,
	useMediaLibraryPermissions,
} from 'expo-image-picker';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { TabNavigation } from '@/types/navigation';
import { useAuthContext } from '../contexts/AuthContext';
import { db, auth } from '../fbase';
import {
	addDataToFirestore,
	setDataToFirestore,
} from '../utilities/firebaseApi';
import { uploadFiles } from '../utilities/uploadFiles';
import ItemSelect from '../components/NewPost/ItemSelect';
import CartItem from '../components/NewPost/CartItem';
import Button from '../components/ui/Button';
import useToggle from '../hooks/useToggle';
import { Colors } from '@/constants/Color';

const NewPost = () => {
	const navigation = useNavigation<TabNavigation>();
	const { userInfo } = useAuthContext();
	const [type, setType] = useState('buy');
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [images, setImages] = useState<ImagePickerAsset[]>([]);
	const [cart, setCart] = useState([]);
	const [isDropdownOpen, toggleIsDropdownOpen] = useToggle(false);
	const [, requestPermission, getPermission] = useMediaLibraryPermissions();

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

	const verifyPermissions = async () => {
		let currentPermission = await getPermission();

		if (currentPermission.status === 'undetermined') {
			currentPermission = await requestPermission();
		}

		if (currentPermission.status === 'denied') {
			Alert.alert(
				'권한 필요',
				'이미지를 업로드하려면 사진 접근 권한이 필요합니다.',
			);
			return false;
		}
		return currentPermission.status === 'granted';
	};

	const pickImages = async () => {
		Keyboard.dismiss(); // 키보드 닫기

		const hasPermission = await verifyPermissions(); // 사진 권한 확인
		if (!hasPermission) {
			return;
		}

		let result = await launchImageLibraryAsync({
			mediaTypes: 'images',
			allowsMultipleSelection: true,
			selectionLimit: 10,
			aspect: [1, 1],
			quality: 0,
		});

		if (!result.canceled) {
			setImages(result.assets);
		}
	};

	const onSubmit = async () => {
		if (!validateUser()) {
			return navigation.navigate('Login');
		}

		if (!validateForm()) return;

		let requestData: {
			type: string;
			title: string;
			body: string;
			images: string[];
			// cart: CartItem[];
			// cartList: string[];
			createdAt: ReturnType<typeof serverTimestamp>;
			creatorDisplayName?: string;
			creatorId?: string;
		} = {
			type,
			title,
			body,
			images: [],
			// cart,
			// cartList: cart.map(({ name }) => name.replaceAll(' ', '')),
			createdAt: serverTimestamp(),
			creatorDisplayName: userInfo?.displayName,
			creatorId: userInfo?.uid,
			// 	creatorIslandName: userInfo?.islandName,
			// 	done: false,
			// 	comments: 0,
		};

		if (images.length) {
			const imageUrls: string[] = await uploadFiles({
				directory: 'Boards',
				images,
			});
			requestData.images = imageUrls;
		}

		try {
			await addDataToFirestore({ directory: 'Boards', requestData });
			Alert.alert('작성 완료', '글이 작성되었습니다.');
			setType('buy');
			setTitle('');
			setBody('');
			setImages([]);
			setCart([]);
			navigation.navigate('Home');
			// navigation.navigate('PostDetail', { id: docId });
		} catch (error) {
			Alert.alert('오류', '글을 작성하는 중 오류가 발생했습니다.');
			console.log(error);
		}
	};

	return (
		<KeyboardAvoidingView style={styles.container}>
			{/* Type */}
			<View style={styles.typeContainer}>
				<TouchableOpacity
					style={[styles.typeButton, type === 'buy' && styles.typeButtonActive]}
					onPress={() => setType('buy')}
				>
					<Text
						style={[styles.typeText, type === 'buy' && styles.typeTextActive]}
					>
						구해요
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.typeButton,
						type === 'sell' && styles.typeButtonActive,
					]}
					onPress={() => setType('sell')}
				>
					<Text
						style={[styles.typeText, type === 'sell' && styles.typeTextActive]}
					>
						팔아요
					</Text>
				</TouchableOpacity>
			</View>

			{/* Title */}
			<View style={styles.inputGroup}>
				<Text style={styles.label}>제목</Text>
				<TextInput
					value={title}
					onChangeText={(text) => setTitle(text)}
					placeholder='DIY 작업대 레시피 구해요 :)'
					style={styles.input}
				/>
			</View>

			{/* Body */}
			<View style={styles.inputGroup}>
				<Text style={styles.label}>내용</Text>
				<TextInput
					value={body}
					onChangeText={setBody}
					placeholder='2마일에 구매하고 싶어요. 채팅 주세요!'
					style={[styles.input, styles.textarea]}
					multiline
				/>
			</View>

			{/* Photo */}
			<View style={styles.inputGroup}>
				<Text style={styles.label}>사진</Text>

				{images.length ? (
					<ScrollView horizontal style={styles.imagesContainer}>
						{images.map((image, index) => (
							<Image
								key={index}
								source={{ uri: image.uri }}
								style={styles.photoPreview}
							/>
						))}
						<TouchableOpacity
							style={[
								styles.photoPreview,
								{
									padding: 8,
									backgroundColor: Colors.base,
									borderWidth: 1,
									borderColor: Colors.border_gray,
								},
							]}
							onPress={pickImages}
						>
							<Text style={styles.photoPlaceholder}>사진을 추가하세요.</Text>
						</TouchableOpacity>
					</ScrollView>
				) : (
					<TouchableOpacity style={styles.photoInput} onPress={pickImages}>
						<Text style={styles.photoPlaceholder}>사진을 추가하세요.</Text>
					</TouchableOpacity>
				)}

				{/* <TouchableOpacity
					onPress={() => setImages([])}
					style={styles.deletePhotoButton}
				>
					<Text style={styles.deletePhotoText}>사진 삭제</Text>
				</TouchableOpacity> */}
			</View>

			{/* ItemSelect */}
			<ItemSelect
				isDropdownOpen={isDropdownOpen}
				toggleIsDropdownOpen={toggleIsDropdownOpen}
				cart={cart}
				setCart={setCart}
			/>

			{/* Item List */}
			<FlatList
				data={cart}
				keyExtractor={(item) => item.UniqueEntryID}
				renderItem={({ item }) => (
					<CartItem item={item} cart={cart} setCart={setCart} />
				)}
			/>

			<Button color='mint' size='lg' onPress={onSubmit}>
				작성
			</Button>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: 'white',
	},
	typeContainer: {
		flexDirection: 'row',
		marginBottom: 16,
	},
	typeButton: {
		flex: 1,
		padding: 12,
		alignItems: 'center',
		borderRadius: 4,
	},
	typeButtonActive: {
		backgroundColor: Colors.border_gray,
	},
	typeText: {
		fontSize: 16,
		color: Colors.font_gray,
	},
	typeTextActive: {
		color: Colors.primary,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		marginBottom: 8,
		color: Colors.font_black,
	},
	input: {
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 4,
		padding: 12,
		fontSize: 14,
		backgroundColor: Colors.base,
	},
	textarea: {
		height: 120,
		textAlignVertical: 'top',
	},
	imagesContainer: {
		paddingVertical: 16,
	},
	photoInput: {
		height: 200,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.base,
	},
	photoPreview: {
		width: 100,
		height: 100,
		margin: 6,
		borderRadius: 12,
	},
	photoPlaceholder: {
		color: Colors.font_gray,
		fontSize: 14,
	},
	deletePhotoButton: {
		marginTop: 8,
		alignItems: 'center',
	},
	deletePhotoText: {
		color: '#d32f2f',
		fontSize: 14,
	},
});

export default NewPost;

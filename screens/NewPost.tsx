import { useState } from 'react';
import {
	StyleSheet,
	FlatList,
	Alert,
	KeyboardAvoidingView,
	ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import { serverTimestamp } from 'firebase/firestore';
import type { TabNavigation } from '@/types/navigation';
import { useAuthContext } from '../contexts/AuthContext';
import { auth } from '../fbase';
import { addDataToFirestore } from '../utilities/firebaseApi';
import { uploadFiles } from '../utilities/uploadFiles';
import { Colors } from '@/constants/Color';

import TypeSelect from '@/components/NewPost/TypeSelect';
import TitleInput from '@/components/NewPost/TitleInput';
import BodyInput from '@/components/NewPost/BodyInput';
import ImageInput from '@/components/NewPost/ImageInput';
import CartItem from '../components/NewPost/CartItem';
import ItemSelect from '../components/NewPost/ItemSelect';
import Button from '../components/ui/Button';
import useToggle from '../hooks/useToggle';

const NewPost = () => {
	const navigation = useNavigation<TabNavigation>();
	const { userInfo } = useAuthContext();
	const [type, setType] = useState('buy');
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [images, setImages] = useState<ImagePickerAsset[]>([]);
	const [cart, setCart] = useState([]);
	const [isDropdownOpen, toggleIsDropdownOpen] = useToggle(false);

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
			<ScrollView nestedScrollEnabled={true}>
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

				{/* <ItemSelect
					isDropdownOpen={isDropdownOpen}
					toggleIsDropdownOpen={toggleIsDropdownOpen}
					cart={cart}
					setCart={setCart}
				/> */}

				{/* <FlatList
					data={cart}
					keyExtractor={(item) => item.UniqueEntryID}
					renderItem={({ item }) => (
						<CartItem item={item} cart={cart} setCart={setCart} />
					)}
				/> */}

				<Button color='mint' size='lg' onPress={onSubmit}>
					작성
				</Button>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 24,
		backgroundColor: 'white',
	},
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
});

export default NewPost;

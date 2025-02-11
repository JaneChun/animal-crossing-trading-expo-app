import { useCallback, useState } from 'react';
import {
	FlatList,
	StyleSheet,
	Text,
	View,
	ActivityIndicator,
} from 'react-native';
import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	serverTimestamp,
	startAfter,
} from 'firebase/firestore';
import { db } from '../fbase';
import PostUnit from '../components/Home/PostUnit';
import { CartItem } from './NewPost';
import { Colors } from '@/constants/Color';
import { useFocusEffect } from '@react-navigation/native';
import useLoading from '@/hooks/useLoading';

export interface doc {
	id: string;
	type: string;
	title: string;
	body: string;
	images: string[];
	creatorDisplayName: string;
	creatorId: string;
	createdAt: ReturnType<typeof serverTimestamp>;
	cart?: CartItem[];
	// done?: boolean;
	// comments?: number;
}

const Home = () => {
	const [data, setData] = useState<doc[]>([]);
	const [lastestDoc, setLastestDoc] = useState<any>();
	const [isEnd, setIsEnd] = useState(false);
	const { isLoading, setIsLoading, LoadingIndicator } = useLoading();

	let q = query(
		collection(db, 'Boards'),
		orderBy('createdAt', 'desc'),
		limit(10),
	);

	const getData = async () => {
		if (isEnd) return;

		setIsLoading(true);
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) {
			setIsEnd(true);
			setIsLoading(false);
			return;
		}

		const data: doc[] = querySnapshot.docs.map((doc) => {
			const docData = doc.data() as Omit<doc, 'id'>; // 'id' 제외한 doc 타입으로 변환

			return { id: doc.id, ...docData }; // doc 인터페이스의 필수 속성 유지
		});

		setData(data);
		setLastestDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
		setIsLoading(false);
	};

	// Home이 포커스될 때마다 실행
	useFocusEffect(
		useCallback(() => {
			setData([]);
			getData();
		}, []),
	);

	const nextPage = () => {
		if (lastestDoc) {
			q = query(
				collection(db, 'Boards'),
				orderBy('createdAt', 'desc'),
				limit(10),
				startAfter(lastestDoc),
			);
			getData();
		}
	};

	return (
		<View style={styles.container}>
			{/* 헤더 */}
			<Text style={styles.header}>거래글</Text>

			{/* 로딩 또는 데이터 */}
			{isLoading ? (
				<LoadingIndicator />
			) : (
				<FlatList
					data={data}
					keyExtractor={({ id }) => id}
					renderItem={({ item }) => (
						<PostUnit
							id={item.id}
							type={item.type}
							title={item.title}
							previewImage={item.images?.[0]}
							createdAt={item.createdAt}
							creatorDisplayName={item.creatorDisplayName}
							creatorId={item.creatorId}
							// comments={item.comments}
							// done={item.done}
						/>
					)}
					onEndReached={!isEnd ? nextPage : undefined}
					onEndReachedThreshold={0.5}
					ListFooterComponent={
						isEnd ? (
							<Text style={styles.footerText}>마지막 글입니다.</Text>
						) : isLoading ? (
							<ActivityIndicator size='small' color={Colors.primary} />
						) : null
					}
				/>
			)}

			{/* "더 보기" 버튼 */}
			{/* {!isEnd && data.length > 0 && !isLoading && (
				<TouchableOpacity style={styles.button} onPress={nextPage}>
					<Text style={styles.buttonText}>더 보기</Text>
				</TouchableOpacity>
			)} */}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: 'white',
	},
	header: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
		color: Colors.font_black,
	},
	footerText: {
		textAlign: 'center',
		color: Colors.font_gray,
		marginVertical: 16,
	},
	button: {
		marginVertical: 16,
		padding: 12,
		backgroundColor: '#888',
		borderRadius: 8,
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
});

export default Home;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	startAfter,
	where,
} from 'firebase/firestore';
import { db } from '../../fbase';
import PostUnit from '../Home/PostUnit';
import { useAuthContext } from '@/contexts/AuthContext';
import { doc } from '@/screens/Home';
import useLoading from '@/hooks/useLoading';
import { Colors } from '@/constants/Color';

const MyPosts = () => {
	const [data, setData] = useState<doc[]>([]);
	const [lastestDoc, setLastestDoc] = useState<any>(null);
	const [isEnd, setIsEnd] = useState<boolean>(false);
	const { isLoading, setIsLoading, LoadingIndicator } = useLoading();
	const { userInfo } = useAuthContext();

	useEffect(() => {
		if (!userInfo) return;

		getData();
	}, []);

	let q = query(
		collection(db, 'Boards'),
		where('creatorId', '==', userInfo?.uid || ''),
		orderBy('createdAt', 'desc'),
		limit(5),
	);

	const getData = async () => {
		if (!userInfo || isEnd) return;

		setIsLoading(true);

		try {
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
		} catch (e) {
			console.log(e);
		} finally {
			setIsLoading(false);
		}
	};

	const nextPage = async () => {
		if (!userInfo || !lastestDoc) return;

		q = query(
			collection(db, 'Boards'),
			where('creatorId', '==', userInfo.uid),
			orderBy('createdAt', 'desc'),
			limit(10),
			startAfter(lastestDoc),
		);

		getData();
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>작성한 글</Text>
			{isLoading ? (
				<LoadingIndicator />
			) : (
				<>
					{data.map((item) => (
						<PostUnit
							key={item.id}
							id={item.id}
							type={item.type}
							title={item.title}
							previewImage={item.images?.[0]}
							createdAt={item.createdAt}
							creatorDisplayName={item.creatorDisplayName}
							creatorId={item.creatorId}
						/>
					))}
					<View>
						{isEnd ? (
							<Text style={styles.footerText}>마지막 글입니다.</Text>
						) : null}
						{/* ) : isLoading ? (
						<ActivityIndicator size='small' color={Colors.primary} />) : null */}
					</View>
				</>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginTop: 24,
		marginBottom: 8,
	},
	footerText: {
		textAlign: 'center',
		color: Colors.font_gray,
		marginVertical: 16,
	},
	// footer: { alignItems: 'center', marginVertical: 16 },
	// message: { fontSize: 14, color: 'gray' },
	// button: {
	// 	paddingVertical: 10,
	// 	paddingHorizontal: 20,
	// 	backgroundColor: '#ddd',
	// 	borderRadius: 8,
	// },
	// buttonText: { fontSize: 14, color: '#333' },
});

export default MyPosts;

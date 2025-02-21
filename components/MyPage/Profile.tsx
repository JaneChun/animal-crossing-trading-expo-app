import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { TabNavigation } from '@/types/navigation';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Button from '../ui/Button';

const Profile = () => {
	const { userInfo } = useAuthContext();
	const navigation = useNavigation<TabNavigation>();

	const editProfile = () => {
		navigation.navigate('EditProfile', { userInfo });
	};

	return (
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				{userInfo?.photoURL ? (
					<Image source={{ uri: userInfo?.photoURL }} style={styles.image} />
				) : (
					<View style={[styles.image, styles.emptyImage]}>
						<FontAwesome name='leaf' color={Colors.font_light_gray} size={42} />
					</View>
				)}
			</View>
			<Text style={styles.displayName}>{userInfo?.displayName}</Text>
			<View style={styles.islandInfoContainer}>
				<Image
					source={{
						uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FCoconut_Tree_NH_Inv_Icon.png?alt=media&token=cd997010-694e-49b0-9390-483772cdad8a',
					}}
					style={styles.islandIcon}
				/>
				<Text style={styles.islandText}>
					{userInfo?.islandName || '어떤 섬에 사시나요?'}
				</Text>
			</View>

			{/* 버튼 */}
			<View style={styles.buttonsContainer}>
				<Button color='gray' size='md' onPress={editProfile}>
					프로필 수정
				</Button>
			</View>
		</View>
	);
};

export default Profile;

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingVertical: 40,
		alignItems: 'center',
		backgroundColor: 'white',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		elevation: 5,
		shadowColor: Colors.border_gray,
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowOpacity: 1,
		shadowRadius: 2,
	},
	imageContainer: {},
	image: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 16,
	},
	emptyImage: {
		backgroundColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
	},
	displayName: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	islandInfoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	imageEditIndicator: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
	},
	islandIcon: {
		width: 20,
		height: 20,
		marginRight: 6,
	},
	islandText: {
		color: Colors.font_gray,
	},
	buttonsContainer: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 10,
	},
});

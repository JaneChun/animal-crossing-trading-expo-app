import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import React from 'react';
import { Alert, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Button from './Button';

interface UpdateModalProps {
	isVisible: boolean;
	isForceUpdate: boolean;
	messages: string[];
	storeUrl?: string;
	onClose: () => void;
}

export const UpdateModal = ({
	isVisible,
	isForceUpdate,
	messages,
	storeUrl,
	onClose,
}: UpdateModalProps) => {
	const handleUpdate = async () => {
		try {
			if (storeUrl) {
				const canOpen = await Linking.canOpenURL(storeUrl);
				if (canOpen) {
					await Linking.openURL(storeUrl);
				} else {
					Alert.alert('오류', '앱 스토어를 열 수 없습니다.');
				}
			}
		} catch (error) {
			Alert.alert('오류', '앱 스토어로 이동하는 중 오류가 발생했습니다.');
		}
	};

	const handleSkip = () => {
		if (!isForceUpdate) {
			onClose();
		}
	};

	const handleBackdropPress = () => {
		// 강제 업데이트가 아닌 경우에만 백드롭 터치로 닫기 허용
		if (!isForceUpdate) {
			onClose();
		}
	};

	return (
		<Modal
			visible={isVisible}
			transparent
			animationType='fade'
			onRequestClose={handleSkip} // Android 백 버튼 처리
		>
			<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleBackdropPress}>
				<TouchableOpacity
					style={styles.modalContainer}
					activeOpacity={1}
					onPress={() => {}} // 모달 내부 터치 시 닫히지 않도록
				>
					<View style={styles.content}>
						<FastImage
							source={require('../../assets/images/app_icon.webp')}
							style={styles.image}
							resizeMode='contain'
						/>

						{/* 제목 */}
						<Text style={styles.title}>새로운 버전이 업데이트되었어요!</Text>

						{/* 메시지 */}
						<View style={styles.description}>
							{messages?.map((message, index) => (
								<Text key={index} style={styles.message}>
									• {message}
								</Text>
							))}
						</View>

						{/* 버튼 영역 */}
						<View style={styles.buttonContainer}>
							<Button size='lg' color='mint' onPress={handleUpdate}>
								<Text>업데이트 하러가기</Text>
							</Button>

							{!isForceUpdate && (
								<TouchableWithoutFeedback style={styles.laterButton} onPress={onClose}>
									<Text style={styles.laterButtonText}>다음에 할게요</Text>
								</TouchableWithoutFeedback>
							)}
						</View>
					</View>
				</TouchableOpacity>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)', // 더 진한 배경으로 강제성 강조
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalContainer: {
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 24,
		width: '90%',
		maxWidth: 400,
		maxHeight: '80%',
		// 그림자 효과
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 10,
	},
	content: {
		alignItems: 'center',
	},
	image: {
		width: 100,
		height: 100,
		marginBottom: 12,
	},
	title: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.bold,
		color: Colors.font_black,
		textAlign: 'center',
		marginBottom: 18,
	},
	description: {
		marginBottom: 32,
	},
	message: {
		fontSize: FontSizes.sm,
		color: Colors.font_dark_gray,
		lineHeight: 20,
	},
	buttonContainer: {
		width: '100%',
	},
	laterButton: {
		marginTop: 12,
	},
	laterButtonText: {
		color: Colors.font_gray,
		textAlign: 'center',
	},
});

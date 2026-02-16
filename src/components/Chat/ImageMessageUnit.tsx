import ImageViewerModal from '@/components/ui/ImageViewerModal';
import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useUserInfo } from '@/stores/auth';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { IMessage } from 'react-native-gifted-chat';

const ImageMessageUnit = ({ message }: { message: IMessage }) => {
	const userInfo = useUserInfo();
	const [isViewerVisible, setIsViewerVisible] = useState(false);

	const formattedDate = (
		message.createdAt instanceof Date
			? message.createdAt
			: new Date(message.createdAt)
	).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

	const isMine = message.user._id === userInfo?.uid;

	return (
		<>
			<View
				style={[
					styles.messageContainer,
					{ alignSelf: isMine ? 'flex-end' : 'flex-start' },
				]}
			>
				{isMine && (
					<View style={styles.infoContainer}>
						{!message.received && <Text style={styles.infoText}>안읽음</Text>}
						<Text style={styles.infoText}>{formattedDate}</Text>
					</View>
				)}

				<Pressable
					onPress={() => setIsViewerVisible(true)}
					style={isMine ? styles.sentMargin : styles.receivedMargin}
					testID='chatImageBubble'
				>
					<Image
						source={{ uri: message.image }}
						style={styles.image}
						contentFit='cover'
						transition={200}
					/>
				</Pressable>

				{!isMine && <Text style={styles.infoText}>{formattedDate}</Text>}
			</View>

			<ImageViewerModal
				visible={isViewerVisible}
				images={[message.image!]}
				onRequestClose={() => setIsViewerVisible(false)}
			/>
		</>
	);
};

export default ImageMessageUnit;

const styles = StyleSheet.create({
	messageContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 6,
		marginBottom: 8,
	},
	image: {
		width: 200,
		height: 200,
		borderRadius: 16,
	},
	sentMargin: {
		marginRight: 24,
	},
	receivedMargin: {
		marginLeft: 24,
	},
	infoContainer: {
		alignItems: 'flex-end',
	},
	infoText: {
		fontSize: FontSizes.xxs,
		color: Colors.font_gray,
		fontWeight: FontWeights.light,
	},
});

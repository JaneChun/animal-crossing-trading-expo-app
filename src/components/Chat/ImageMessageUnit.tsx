import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IMessage } from 'react-native-gifted-chat';

import ImageViewerModal from '@/components/ui/ImageViewerModal';
import Text from '@/components/ui/Text';
import { useUserInfo } from '@/stores/auth';

import ImageWithFallback from '../ui/ImageWithFallback';

const ImageMessageUnit = ({ message }: { message: IMessage }) => {
	const userInfo = useUserInfo();
	const [isViewerVisible, setIsViewerVisible] = useState(false);

	const formattedDate = (
		message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt)
	).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

	const isMine = message.user._id === userInfo?.uid;

	return (
		<>
			<View
				style={[styles.messageContainer, { alignSelf: isMine ? 'flex-end' : 'flex-start' }]}
			>
				{isMine && (
					<View style={styles.infoContainer}>
						{!message.received && (
							<Text variant="micro" weight="light" color="tertiary">
								안읽음
							</Text>
						)}
						<Text variant="micro" weight="light" color="tertiary">
							{formattedDate}
						</Text>
					</View>
				)}

				<Pressable
					onPress={() => setIsViewerVisible(true)}
					style={isMine ? styles.sentMargin : styles.receivedMargin}
					testID="chatImageBubble"
				>
					<ImageWithFallback uri={message.image} style={styles.image} />
				</Pressable>

				{!isMine && (
					<Text variant="micro" weight="light" color="tertiary">
						{formattedDate}
					</Text>
				)}
			</View>

			{isViewerVisible && (
				<ImageViewerModal
					visible={isViewerVisible}
					images={message.image ? [message.image] : []}
					onRequestClose={() => setIsViewerVisible(false)}
				/>
			)}
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
		aspectRatio: 4 / 3,
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
});

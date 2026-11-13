import { StyleSheet, View } from 'react-native';
import { IMessage } from 'react-native-gifted-chat';

import Text from '@/components/ui/Text';
import { useUserInfo } from '@/stores/auth';
import { Theme, useThemedStyles } from '@/theme';

const MessageUnit = ({ message }: { message: IMessage }) => {
	const styles = useThemedStyles(makeStyles);
	const userInfo = useUserInfo();

	const formattedDate = (
		message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt)
	).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

	const isMine = message.user._id === userInfo?.uid;

	return (
		<View style={[styles.messageContainer, { alignSelf: isMine ? 'flex-end' : 'flex-start' }]}>
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

			<View
				style={[styles.messageBubble, isMine ? styles.sentBubble : styles.receivedBubble]}
			>
				<Text variant="body2" color={isMine ? 'onBrand' : 'primary'}>
					{message.text}
				</Text>
			</View>

			{!isMine && (
				<Text variant="micro" weight="light" color="tertiary">
					{formattedDate}
				</Text>
			)}
		</View>
	);
};

export default MessageUnit;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		messageContainer: {
			flexDirection: 'row',
			alignItems: 'flex-end',
			gap: 6,
			marginBottom: 8,
		},
		messageBubble: {
			maxWidth: '75%',
			paddingVertical: 12,
			paddingHorizontal: 16,
			borderRadius: 16,
		},
		sentBubble: {
			backgroundColor: colors.brand.primary,
			marginRight: 24,
		},
		receivedBubble: {
			backgroundColor: colors.bg.raised,
			marginLeft: 24,
		},
		infoContainer: {
			alignItems: 'flex-end',
		},
	});

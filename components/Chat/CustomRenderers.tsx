import DateSeparator from '@/components/Chat/DateSeparator';
import MessageUnit from '@/components/Chat/MessageUnit';
import SystemMessageUnit from '@/components/Chat/SystemMessageUnit';
import { Colors } from '@/constants/Color';
import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { IMessage } from 'react-native-gifted-chat';
import ChatInput from './ChatInput';
import ReviewMessageUnit from './ReviewMessageUnit';

export const renderMessage = ({
	currentMessage,
}: {
	currentMessage: IMessage;
}) => {
	if (currentMessage.user._id === 'system') {
		return <SystemMessageUnit message={currentMessage} />;
	}

	if (currentMessage.user._id === 'review') {
		return <ReviewMessageUnit message={currentMessage} />;
	}

	return <MessageUnit message={currentMessage} />;
};

export const renderDay = (props: any) => {
	const { currentMessage, nextMessage } = props;

	const currentDate =
		currentMessage?.createdAt instanceof Date
			? currentMessage.createdAt
			: new Date(currentMessage?.createdAt);

	const nextDate =
		nextMessage?.createdAt instanceof Date
			? nextMessage.createdAt
			: new Date(nextMessage?.createdAt);

	if (!nextDate) return null;

	const isDifferentDay = currentDate.toDateString() === nextDate.toDateString();

	if (!isDifferentDay) return null;

	const formattedDate = currentDate.toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return <DateSeparator date={formattedDate} />;
};

export const renderComposer = ({
	disabled,
	onSend,
}: {
	disabled: boolean;
	onSend: (text: string) => void;
}) => {
	return <ChatInput disabled={disabled} onSubmit={onSend} />;
};

export const renderScrollToBottomComponent = () => (
	<View style={styles.downButtonContainer}>
		<FontAwesome5 name='chevron-down' size={20} style={styles.downIcon} />
	</View>
);

const styles = StyleSheet.create({
	downButtonContainer: {
		width: '100%',
		height: '100%',
		borderRadius: '50%',
		// backgroundColor: Colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	downIcon: {
		// color: 'white',
		color: Colors.primary,
	},
});

import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import DateSeparator from '@/components/Chat/DateSeparator';
import ImageMessageUnit from '@/components/Chat/ImageMessageUnit';
import MessageUnit from '@/components/Chat/MessageUnit';
import SystemMessageUnit from '@/components/Chat/SystemMessageUnit';
import { useTheme } from '@/theme';
import { ExtendedIMessage } from '@/types/chat';
import { RenderDayProps } from '@/types/components';
import { isReviewMessage, isSystemMessage } from '@/utilities/typeGuards/messageGuards';

import ChatInput from './ChatInput';
import ReviewMessageUnit from './ReviewMessageUnit';

export const renderMessage = ({ currentMessage }: { currentMessage: ExtendedIMessage }) => {
	// 시스템 메시지 (게시글 정보)
	if (isSystemMessage(currentMessage)) {
		return <SystemMessageUnit message={currentMessage} />;
	}

	// 리뷰 메시지
	if (isReviewMessage(currentMessage)) {
		return <ReviewMessageUnit message={currentMessage} />;
	}

	// 이미지 메시지
	if (currentMessage.image) {
		return <ImageMessageUnit message={currentMessage} />;
	}

	// 일반 메시지
	return <MessageUnit message={currentMessage} />;
};

export const renderDay = (props: RenderDayProps) => {
	const { currentMessage, nextMessage } = props;

	if (!currentMessage?.createdAt || !nextMessage?.createdAt) return null;

	const currentDate =
		currentMessage.createdAt instanceof Date
			? currentMessage.createdAt
			: new Date(currentMessage.createdAt);

	const nextDate =
		nextMessage.createdAt instanceof Date
			? nextMessage.createdAt
			: new Date(nextMessage.createdAt);

	const isSameDay = currentDate.toDateString() === nextDate.toDateString();

	if (isSameDay) return null;

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
	onImagePress,
}: {
	disabled: boolean;
	onSend: (text: string) => void;
	onImagePress: () => void;
}) => {
	return <ChatInput disabled={disabled} onSubmit={onSend} onImagePress={onImagePress} />;
};

const ScrollToBottomButton = () => {
	const { colors } = useTheme();

	return (
		<View style={styles.downButtonContainer}>
			<FontAwesome5 name="chevron-down" size={20} color={colors.brand.primary} />
		</View>
	);
};

export const renderScrollToBottomComponent = () => <ScrollToBottomButton />;

const styles = StyleSheet.create({
	downButtonContainer: {
		width: '100%',
		height: '100%',
		borderRadius: '50%',
		// backgroundColor: Colors.brand.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

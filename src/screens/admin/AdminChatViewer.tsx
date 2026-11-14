import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import AvatarPair from '@/components/Admin/AvatarPair';
import DateSeparator from '@/components/Chat/DateSeparator';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { useReportedChatMessages } from '@/hooks/admin/query/useReportedChatMessages';
import { useCachedPublicUserInfo } from '@/hooks/shared/useCachedPublicUserInfo';
import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';
import { Message } from '@/types/chat';
import { AdminChatViewerRouteProp } from '@/types/navigation';
import { formatKstDateTime, getKstDateString } from '@/utilities/kstDate';

type ChatRow =
	| { kind: 'date'; key: string; label: string }
	| { kind: 'message'; key: string; message: Message };

const SYSTEM_SENDER_IDS = ['system', 'review'];

const toDateLabel = (kstDate: string) => {
	const [year, month, day] = kstDate.split('-').map(Number);
	return `${year}년 ${month}월 ${day}일`;
};

// "2026.11.14 오후 2:11"에서 "오후 2:11"만 쓴다
const toTimeLabel = (message: Message) =>
	formatKstDateTime(message.createdAt.toDate()).split(' ').slice(1).join(' ');

// 메시지 사이에 날짜 구분선을 끼운 행 목록
const buildChatRows = (messages: Message[]): ChatRow[] => {
	const rows: ChatRow[] = [];
	let previousDate = '';

	messages.forEach((message) => {
		const messageDate = getKstDateString(message.createdAt.toDate());
		if (messageDate !== previousDate) {
			rows.push({
				kind: 'date',
				key: `date-${messageDate}`,
				label: toDateLabel(messageDate),
			});
			previousDate = messageDate;
		}
		rows.push({ kind: 'message', key: message.id, message });
	});

	return rows;
};

// 신고된 채팅 읽기 전용 열람. 입력창·읽음 처리·실시간 갱신이 없다
const AdminChatViewer = () => {
	return (
		<AdminGuard>
			<ChatViewerContent />
		</AdminGuard>
	);
};

const ChatViewerContent = () => {
	const styles = useThemedStyles(makeStyles);
	const navigation = useNavigation();
	const { params } = useRoute<AdminChatViewerRouteProp>();
	const { chatId, reporterId, reporteeId } = params;
	const { data: reporter } = useCachedPublicUserInfo(reporterId);
	const { data: reportee } = useCachedPublicUserInfo(reporteeId);
	const { data: messages, isLoading, isError } = useReportedChatMessages(chatId);

	useEffect(() => {
		navigation.setOptions({
			headerTitle: () => (
				<View style={styles.headerTitle}>
					<AvatarPair photoURLs={[reporter?.photoURL, reportee?.photoURL]} size={28} />
					<Text variant="body1" weight="semibold" numberOfLines={1}>
						{`${reporter?.displayName ?? ''} · ${reportee?.displayName ?? ''}`}
					</Text>
				</View>
			),
		});
	}, [navigation, reporter, reportee, styles.headerTitle]);

	if (isLoading) return <LoadingIndicator />;
	if (isError || !messages) {
		return <EmptyIndicator message="대화를 불러오지 못했습니다." />;
	}

	const rows = buildChatRows(messages);

	const renderRow = ({ item }: { item: ChatRow }) => {
		if (item.kind === 'date') return <DateSeparator date={item.label} />;

		const { message } = item;

		if (SYSTEM_SENDER_IDS.includes(message.senderId)) {
			return (
				<Text variant="caption" color="tertiary" style={styles.systemMessage}>
					{message.body}
				</Text>
			);
		}

		// 신고자는 오른쪽(민트 말풍선), 피신고자는 왼쪽
		const isReporter = message.senderId === reporterId;
		const time = (
			<Text variant="micro" weight="light" color="tertiary">
				{toTimeLabel(message)}
			</Text>
		);
		const bubble = message.imageUrl ? (
			<ImageWithFallback uri={message.imageUrl} style={styles.image} />
		) : (
			<View
				style={[styles.bubble, isReporter ? styles.reporterBubble : styles.reporteeBubble]}
			>
				<Text variant="body2" color={isReporter ? 'onBrand' : 'primary'}>
					{message.body}
				</Text>
			</View>
		);

		return (
			<View style={[styles.messageRow, isReporter ? styles.alignRight : styles.alignLeft]}>
				{isReporter ? time : bubble}
				{isReporter ? bubble : time}
			</View>
		);
	};

	return (
		<FlatList
			data={rows}
			keyExtractor={(row) => row.key}
			renderItem={renderRow}
			style={styles.screen}
			contentContainerStyle={styles.content}
			ListEmptyComponent={<EmptyIndicator message="메시지가 없습니다." />}
		/>
	);
};

export default AdminChatViewer;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.secondary,
		},
		content: {
			paddingTop: Spacing.s,
			paddingBottom: Spacing.l,
		},
		headerTitle: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
		},
		messageRow: {
			flexDirection: 'row',
			alignItems: 'flex-end',
			gap: 6,
			marginBottom: Spacing.s,
			paddingHorizontal: Spacing.xxl,
		},
		alignRight: {
			justifyContent: 'flex-end',
		},
		alignLeft: {
			justifyContent: 'flex-start',
		},
		bubble: {
			maxWidth: 260,
			paddingVertical: Spacing.m,
			paddingHorizontal: Spacing.l,
			borderRadius: BorderRadius.l,
		},
		reporterBubble: {
			backgroundColor: colors.brand.primary,
		},
		reporteeBubble: {
			backgroundColor: colors.bg.raised,
		},
		image: {
			width: 200,
			height: 200,
			borderRadius: BorderRadius.m,
		},
		systemMessage: {
			alignSelf: 'center',
			textAlign: 'center',
			marginVertical: Spacing.s,
			paddingHorizontal: Spacing.xxl,
		},
	});

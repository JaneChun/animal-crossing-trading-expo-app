import { db } from '@/fbase';
import { Message, MessageType, SystemMessage } from '@/types/chat';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useGetChatMessages = (chatId: string) => {
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!chatId) {
			setMessages([]);
			setIsLoading(false);
			return;
		}

		const q = query(
			collection(db, 'Chats', chatId, 'Messages'),
			orderBy('createdAt', 'asc'),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			setIsLoading(true);

			const newMessages = snapshot.docs.map((doc) => {
				return {
					id: doc.id,
					...doc.data(),
				} as Message;
			});

			const grouped: MessageType[] = groupMessagesByDate(newMessages);
			setMessages(grouped);

			setIsLoading(false);
		});

		return () => unsubscribe();
	}, [chatId]);

	return { messages, isLoading };
};

const groupMessagesByDate = (messages: Message[]): MessageType[] => {
	const groupedMessages: MessageType[] = [];
	let lastDate = '';

	messages.forEach((message) => {
		const formattedDate = new Date(
			message.createdAt?.toDate(),
		).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

		if (formattedDate !== lastDate) {
			const dateSeparator: SystemMessage = {
				id: `date-${formattedDate}`,
				isDateSeparator: true,
				date: formattedDate,
			};

			groupedMessages.push(dateSeparator);

			lastDate = formattedDate;
		}

		groupedMessages.push(message);
	});

	return groupedMessages.reverse();
};

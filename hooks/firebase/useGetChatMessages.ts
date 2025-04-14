import { db } from '@/fbase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useGetChatMessages = (chatId: string) => {
	const [messages, setMessages] = useState<any[]>([]);
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

			const newMessages = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			const grouped = groupMessagesByDate(newMessages);
			setMessages(grouped);

			setIsLoading(false);
		});

		return () => unsubscribe();
	}, [chatId]);

	return { messages, isLoading };
};

const groupMessagesByDate = (messages: any[]) => {
	const groupedMessages: any[] = [];
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
			groupedMessages.push({
				id: `date-${formattedDate}`,
				isDateSeparator: true,
				date: formattedDate,
			});

			lastDate = formattedDate;
		}

		groupedMessages.push(message);
	});

	return groupedMessages.reverse();
};

import { db } from '@/config/firebase';
import { Message } from '@/types/chat';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useGetChatMessages = (chatId: string) => {
	const [messages, setMessages] = useState<Message[]>([]);
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

			setMessages(newMessages);

			setIsLoading(false);
		});

		return () => unsubscribe();
	}, [chatId]);

	return { messages, isLoading };
};

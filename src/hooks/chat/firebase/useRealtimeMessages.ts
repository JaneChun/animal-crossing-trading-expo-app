import { db } from '@/config/firebase';
import { Message } from '@/types/chat';
import { Timestamp } from 'firebase/firestore';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';

export const useRealtimeMessages = (chatId: string, count: number) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const oldestTimestampRef = useRef<Timestamp | null>(null);

	useEffect(() => {
		if (!chatId) {
			setMessages([]);
			setIsLoading(false);
			oldestTimestampRef.current = null;
			return;
		}

		setIsLoading(true);

		const q = query(
			collection(db, 'Chats', chatId, 'Messages'),
			orderBy('createdAt', 'desc'),
			limit(count),
		);

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const newMessages = snapshot.docs
					.map(
						(doc) =>
							({
								id: doc.id,
								...doc.data(),
							}) as Message,
					)
					.reverse();

				// 가장 오래된 메시지의 타임스탬프 저장 (페이지네이션 커서)
				if (newMessages.length > 0) {
					oldestTimestampRef.current = newMessages[0].createdAt;
				}

				setMessages(newMessages);
				setIsLoading(false);
			},
			(error) => {
				console.log('실시간 메시지 리스너 오류:', error);
				setIsLoading(false);
			},
		);

		return () => unsubscribe();
	}, [chatId, count]);

	return { messages, isLoading, oldestTimestampRef };
};

import { CreateReportRequest } from '@/types/report';
import { Timestamp } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import { addDocToFirestore } from '../core/firestoreService';

export const createReport = async (requestData: CreateReportRequest) => {
	return firestoreRequest('유저 신고', async () => {
		const createdId = await addDocToFirestore({
			directory: 'Reports',
			requestData: {
				...requestData,
				createdAt: Timestamp.now(),
				resolved: false,
			},
		});

		return createdId;
	});
};
